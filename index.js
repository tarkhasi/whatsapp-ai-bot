import WhatsappWeb from "whatsapp-web.js";
import OpenAI from "openai";
import dotenv from 'dotenv'
import qrcode from "qrcode-terminal";

dotenv.config()

const {Client, LocalAuth} = WhatsappWeb;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const client = new Client({
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    },
    authStrategy: new LocalAuth({
        clientId: "my-bot"
    }),
});


client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// تشخیص مدل
const default_model = process.env.OPENAI_API_MODEL ?? "gpt-4o-mini";
let model_to_use = default_model;

client.on("message", async (msg) => {
    try {
        const userText = msg.body.trim();
        const userId = msg.from; // شماره فرستنده

        if (userText.startsWith("@gpt")) {
            model_to_use = "gpt-4.1-mini";
            await msg.reply(`مدل پاسخ دهی به ${model_to_use} تغییر کرد. `);
            return;
        }
        if (userText.startsWith("@me")) {
            model_to_use = default_model;
            await msg.reply(`مدل پاسخ دهی به ${model_to_use} تغییر کرد. `);
            return;
        }

        // حذف پیشوند از متن کاربر
        const cleanText = userText.replace(/^@\w+\s*/, "");

        const completion = await openai.chat.completions.create({
            model: model_to_use,
            messages: [
                {
                    role: "system",
                    content: "تو یک دستیار فارسی محاوره‌ای هستی. کاربر وقتی از اصل و قوانین صحبت می کند دقیقا راجب همون قانون صحبت کن"
                },
                {role: "user", content: cleanText},
            ],
            temperature: 0.3,
        });

        const reply = completion.choices[0]?.message?.content?.trim();
        if (reply) {
            await msg.reply(reply);
        }

    } catch (err) {
        console.error("خطا:", err);
        await msg.reply("یه مشکلی پیش اومد 🙏");
    }
});

client.initialize();
