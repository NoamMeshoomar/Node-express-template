import { join } from 'path';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import express from 'express';
import serveStatic from 'serve-static';

import shopify from './shopify.js';
import webhooks from './webhooks.js';
import prisma from './prisma/index.js';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
process.env.NODE_ENV === 'production'
? `${process.cwd()}/frontend/dist`
: `${process.cwd()}/frontend/`;

const app = express();

app.use(express.json());

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot()
);
app.post(
	shopify.config.webhooks.path,
	// @ts-ignore
	shopify.processWebhooks({ webhookHandlers: webhooks })
);

app.post("/api/save_cart", async (req, res) => {
	try {
		const { checkoutToken, productIds } = req.body;

		if(!checkoutToken || !productIds) return res.sendStatus(400);

		await prisma.savedCart.create({
			data: {
				id: randomUUID(),
				checkoutToken,
				productIds: JSON.stringify(productIds)
			}
		});

		res.sendStatus(200);
	} catch (error) {
		res.sendStatus(400);
	}
});

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res) => {
	return res.set('Content-Type', 'text/html').send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
