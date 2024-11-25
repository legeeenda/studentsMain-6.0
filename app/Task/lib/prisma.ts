// pages/api/homework.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, taskId } = req.body;

        try {
            // Проверка, существует ли уже запись о выполнении этого задания
            const existingRecord = await prisma.homework.findFirst({
                where: {
                    user_id: userId,
                    task: taskId,
                },
            });

            // Если записи нет, создаем новую
            if (!existingRecord) {
                const homework = await prisma.homework.create({
                    data: {
                        user_id: userId,
                        task: taskId,
                        email: "test@test.com" // заменить на фактический email
                    },
                });
                res.status(200).json(homework);
            } else {
                res.status(200).json({ message: "Task already completed" });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error creating homework' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
