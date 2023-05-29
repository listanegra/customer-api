export const getEnvironmentVariables = (...variables: string[]): Record<string, string> => {
    const missing = variables.filter(e => !process.env[e]);

    if (missing.length) {
        throw new Error(`Missing environment variables [${missing.join()}]`);
    }

    return variables.reduce((object, name) => {
        object[name] = process.env[name]!;
        return object;
    }, {} as Record<string, string>);
};
