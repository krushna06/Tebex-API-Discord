async function generateCheckoutLink(basketIdent) {
    if (!basketIdent) {
        throw new Error('Basket identifier is required to generate checkout link.');
    }

    return `https://pay.tebex.io/${basketIdent}`;
}

module.exports = { generateCheckoutLink };
