const BLOCKED_WORDS = [
    "fi da puta",
    "palvrao",
    "palvrao",
];

function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[@]/g, "a")
        .replace(
            /[3]/g, "e")
        .replace(
            /[1!]/g, "i")
        .replace(
            /[0]/g, "o")
        .replace(
            /[$5]/g, "s")
        .replace(
            /[7]/g, "t")
        .replace(
            /[^a-z0-9]/g, "");
}

function detectProfanity(text) {

    const normalized =
        normalizeText(text);

    return BLOCKED_WORDS.some(
        word =>

            normalized.includes(
                normalizeText(
                    word
                )
            )

    );

}

function validateText(text) {

    if (detectProfanity(text)
    ) {
        throw new Error("Mensagem contém linguagem inadequada");
    }

    return true;

}

export {
    validateText,
    detectProfanity,
    normalizeText
};