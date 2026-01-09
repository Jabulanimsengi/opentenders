import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function checkSlugs() {
    const tenders = await prisma.tender.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            ocid: true,
            slug: true
        }
    });

    let output = 'Sample tenders:\n';
    tenders.forEach(t => {
        output += '\n---\n';
        output += `ID: ${t.id}\n`;
        output += `Title: ${t.title}\n`;
        output += `OCID: ${t.ocid}\n`;
        output += `Slug: ${t.slug}\n`;
    });

    fs.writeFileSync('slug-check.txt', output);
    console.log('Written to slug-check.txt');

    await prisma.$disconnect();
}

checkSlugs();
