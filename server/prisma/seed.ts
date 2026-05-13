import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash1 = await bcrypt.hash('1234', 10);
  const hash2 = await bcrypt.hash('1234', 10);

  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'יאיר', passwordHash: hash1, color: '#1A1A2E' },
  });

  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'מנהל', passwordHash: hash2, color: '#78909C' },
  });

  const achievements = [
    { key: 'first_expense', name: 'מתחילים!', description: 'הוסיף הוצאה ראשונה', icon: '🎯', color: '#6C63FF' },
    { key: 'green_month', name: 'חודש ירוק', description: 'עמדת בתקציב בכל הקטגוריות', icon: '🌿', color: '#4CAF50' },
    { key: 'big_saver', name: 'חוסך גדול', description: 'חסכת מעל ₪1,000 בחודש', icon: '💰', color: '#FFC107' },
    { key: 'week_streak', name: '7 ימים ברצף', description: 'הזנת הוצאות 7 ימים רצופים', icon: '🔥', color: '#FF5722' },
    { key: 'couple_power', name: 'כוח הזוג', description: 'שניכם הזנתם הוצאות באותו יום', icon: '💑', color: '#FF6584' },
    { key: 'under_food', name: 'אכלנו טוב', description: 'נשארתם מתחת לתקציב מזון', icon: '🥗', color: '#8BC34A' },
    { key: 'budget_master', name: 'מאסטר תקציב', description: '3 חודשים ירוקים ברצף', icon: '👑', color: '#FF9800' },
    { key: 'first_budget', name: 'מתכננים!', description: 'הגדרת תקציב לראשונה', icon: '📋', color: '#2196F3' },
    { key: 'ten_expenses', name: '10 הוצאות', description: 'הזנת 10 הוצאות', icon: '📊', color: '#9C27B0' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
