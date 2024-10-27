import { readdirSync } from 'fs';

export function loadEvents(client) {
    const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        import(`../events/${file}`).then(event => {
            const eventName = file.split('.')[0];
            if (event.default.once) {
                client.once(eventName, (...args) => event.default.execute(...args));
            } else {
                client.on(eventName, (...args) => event.default.execute(...args));
            }
        });
    }
}
