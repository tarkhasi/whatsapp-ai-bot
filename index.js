import WhatsappWeb from "whatsapp-web.js";
import OpenAI from "openai";
import dotenv from 'dotenv'
import qrcode from "qrcode-terminal";

dotenv.config()

const {Client, LocalAuth} = WhatsappWeb;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const client = new Client({
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

client.on("message", async (msg) => {
    try {
        const userText = msg.body.trim();
        const userId = msg.from; // شماره فرستنده

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {role: "system", content: "تو یک دستیار فارسی محاوره‌ای هستی."},
                {role: "user", content: userText},
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
