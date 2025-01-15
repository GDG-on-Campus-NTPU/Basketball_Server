export function isVaildEmail(email: string) {
    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    return emailRegex.test(email)
}

export function isVaildName(name: string) {
    return !/[|&;$%@"<>()+,'"]/.test(name);
}

export function timeDifference(time: Date) {
    return (new Date().getTime() - time.getTime()) / 60000;
}

export function checkLogin(event: any) {
    if (!event.context.userId) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        });
    }
}

export function checkAdmin(event: any) {
    for (const admin in process.env) {
        if(admin.startsWith('ADMIN_EMAIL_') && process.env[admin] == event.context.email) {
            return;
        }
    }
    throw createError({
        statusCode: 403,
        message: 'Forbidden'
    });
}

