import fastify from "fastify";
import sensible from "@fastify/sensible"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"

dotenv.config();

const app = fastify();
app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRET })
app.register(cors, {
	origin: "http://127.0.0.1:5173",
	credentials: true
})

app.addHook("onRequest", (req, res, done) => {
	if (req.cookies.userId !== CURRENT_USER_ID) {
		req.cookies.userId = CURRENT_USER_ID
		res.clearCookie("userId")
		res.setCookie("userId", CURRENT_USER_ID)
	}
	done()
})

const prisma = new PrismaClient();

const CURRENT_USER_ID = (
	await prisma.user.findFirst({ where: { name: "Sally" } })
).id

const COMMENT_SELECT_FIELDS = {
	id: true,
	message: true,
	parentId: true,
	created_at: true,
	user: {
		select: {
			id: true,
			name: true,
		}
	}
}

app.get("/posts", async (req, res) => {
	return await commitToDb(prisma.post.findMany({
		select: {
			id: true,
			title: true
		},
	}));
});

app.get("/posts/:id", async (req, res) => {
	return await commitToDb(prisma.post.findUnique({
		where: { id: req.params.id },
		select: {
			body: true,
			title: true,
			comments: {
				orderBy: {
					created_at: "desc"
				},
				select: COMMENT_SELECT_FIELDS
			}
		}
	}));
});

app.post("/posts/:id/comments", async (req, res) => {
	if (req.body.message === "" || req.body.message == null) {
		return res.send(app.httpErrors.badRequest("Message is required"))
	}
	return await commitToDb(
		prisma.comment.create({
			data: {
				message: req.body.message,
				userId: req.cookies.userId,
				parentId: req.body.parentId,
				postId: req.params.id
			},
			select: COMMENT_SELECT_FIELDS
		})
	)
})

async function commitToDb(promise) {
	const [error, data] = await app.to(promise);
	if (error) return app.httpErrors.internalServerError(error.message);
	return data;
};

app.listen({ port: process.env.PORT });