import prisma from '~~/lib/prisma';
import { checkAdmin, checkLogin } from '~~/lib/util';

export default defineEventHandler(async (event) => {
    checkLogin(event);
    
    const userIdStr = getRouterParam(event, 'userId');

    if (userIdStr == undefined || isNaN(parseInt(userIdStr)) || isNaN(Number(userIdStr))) {
        throw createError({
            statusCode: 400,
            message: 'Invalid userId'
        })
    }

    const userId = parseInt(userIdStr);

    if(event.context.userId != userId){
        checkAdmin(event);
    }

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    })

    return user;
});