// pages/api/homework.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, taskId } = req.body;

        try {
            const homework = await prisma.homework.create({
                data: {
                    user_id: userId,
                    task: taskId,
                },
            });
            res.status(200).json(homework);
        } catch (error) {
            console.error("Ошибка при сохранении в базу данных:", error);
            res.status(500).json({ error: 'Ошибка при сохранении выполнения задания' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
