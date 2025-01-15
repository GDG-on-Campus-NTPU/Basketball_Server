import prisma from '~~/lib/prisma';
import { isVaildEmail, isVaildName } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    const { name, email } = await readBody(event) as {
        name: string | undefined,
        email: string | undefined
    };

    if (name == undefined || email == undefined) {
        throw createError({
            statusCode: 400,
            message: 'parameter name and email are required'
        });
    }

    if (isVaildName(name) === false) {
        throw createError({
            statusCode: 400,
            message: 'Invalid name'
        });
    }

    if (isVaildEmail(email) === false) {
        throw createError({
            statusCode: 400,
            message: 'Invalid email'
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (existingUser != null) {
        throw createError({
            statusCode: 409,
            message: 'Email already in use'
        });
    }

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return newUser;
});