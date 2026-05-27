import dotenv from "dotenv";

dotenv.config();

export class MoodleServiceClient {
  constructor() {
    this.baseUrl = process.env.MOODLE_URL;
    this.token = process.env.MOODLE_TOKEN;
    this.format = process.env.MOODLE_REST_FORMAT || "json";
    this.enabled = process.env.MOODLE_ENABLED === "true";
  }

  async call(wsfunction, params = {}) {
    if (!this.enabled) {
      return {
        synced: false,
        reason: "Moodle não habilitado"
      };
    }

    const body = new URLSearchParams();

    body.append("wstoken", this.token);
    body.append("wsfunction", wsfunction);
    body.append("moodlewsrestformat", this.format);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        body.append(key, String(value));
      }
    });

    const response = await fetch(
      `${this.baseUrl}/webservice/rest/server.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );

    const data = await response.json();

    if (!response.ok || data?.exception) {
      throw new Error(data?.message || "Erro ao chamar Moodle");
    }

    return data;
  }

  async createCourseFromLearningPath(path) {
    const shortname = `SICIT-${path.id}`.substring(0, 50);

    const result = await this.call("core_course_create_courses", {
      "courses[0][fullname]": path.title,
      "courses[0][shortname]": shortname,
      "courses[0][categoryid]": "1",
      "courses[0][summary]": path.description || "",
      "courses[0][visible]": "1",
      "courses[0][enablecompletion]": "1",
      "courses[0][numsections]": String(path.steps?.length || 1)
    });

    console.log("MOODLE CREATE COURSE RESULT:", JSON.stringify(result, null, 2));

    if (!Array.isArray(result) || !result[0]?.id) {
      throw new Error(`Falha criando curso no Moodle: ${JSON.stringify(result)}`);
    }

    const course = result[0];

    return {
      synced: true,
      externalSystem: "MOODLE",
      externalStatus: "COURSE_CREATED",
      moodleCourseId: course.id,
      moodleShortname: shortname,
      moodleCourse: course
    };
  }

  async syncLearningPathResult(result) {
    return {
      synced: true,
      externalSystem: "MOODLE",
      externalStatus: "RESULT_RECEIVED",
      result
    };
  }

  async getUserByEmail(email) {
    const result = await this.call("core_user_get_users_by_field", {
      field: "email",
      "values[0]": email
    });

    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  }

  async createUser(user) {
    const username = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");

    const result = await this.call("core_user_create_users", {
      "users[0][username]": username,
      "users[0][password]": "User@12345",
      "users[0][firstname]": user.name || user.email,
      "users[0][lastname]": user.role || "SICIT",
      "users[0][email]": user.email,
      "users[0][auth]": "manual"
    });

    if (!Array.isArray(result) || !result[0]?.id) {
      throw new Error(`Falha criando usuário no Moodle: ${JSON.stringify(result)}`);
    }

    return {
      ...result[0],
      username
    };
  }

  async syncUser(user) {
    if (!user?.email) {
      throw new Error("Usuário sem e-mail não pode ser sincronizado com Moodle");
    }

    const existingUser = await this.getUserByEmail(user.email);

    if (existingUser) {
      return existingUser;
    }

    return this.createUser(user);
  }

  async enrolUser({ moodleUserId, moodleCourseId }) {
    return this.call("enrol_manual_enrol_users", {
      "enrolments[0][roleid]": "5",
      "enrolments[0][userid]": String(moodleUserId),
      "enrolments[0][courseid]": String(moodleCourseId)
    });
  }

  async syncUsersAndEnrol({ users, moodleCourseId }) {
    const results = [];

    for (const user of users) {
      const moodleUser = await this.syncUser(user);

      await this.enrolUser({
        moodleUserId: moodleUser.id,
        moodleCourseId
      });

      results.push({
        sicitUserId: user.id,
        email: user.email,
        moodleUserId: moodleUser.id,
        moodleCourseId,
        enrolled: true
      });
    }

    return results;
  }

  async addCourseNote({ moodleUserId, moodleCourseId, text }) {
    return this.call("core_notes_create_notes", {
      "notes[0][userid]": String(moodleUserId),
      "notes[0][publishstate]": "personal",
      "notes[0][courseid]": String(moodleCourseId),
      "notes[0][text]": text,
      "notes[0][format]": "1"
    });
  }

  async getCourseCompletion({ moodleUserId, moodleCourseId }) {
    try {
      const result = await this.call("core_completion_get_course_completion_status", {
        userid: String(moodleUserId),
        courseid: String(moodleCourseId)
      });

      return {
        completed: result?.completionstatus?.completed || false,
        aggregation: result?.completionstatus?.aggregation || 0,
        progress: result?.completionstatus?.completions || [],
        source: "MOODLE"
      };
    } catch (error) {
      if (error.message?.includes("No completion criteria")) {
        return {
          completed: false,
          aggregation: 0,
          progress: [],
          source: "MOODLE",
          warning: "Curso Moodle sem critérios de conclusão configurados"
        };
      }

      throw error;
    }
  }
}