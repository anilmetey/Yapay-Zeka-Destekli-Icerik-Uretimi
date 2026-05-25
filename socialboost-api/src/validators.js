const { z } = require('zod');

const platformSchema = z.enum(['instagram', 'tiktok', 'linkedin']);
const tierSchema = z.enum(['free', 'starter', 'pro']);

const generatePostSchema = z.object({
  productName: z.string().trim().min(2).max(90),
  description: z.string().trim().min(10).max(1200),
  platform: platformSchema.default('instagram'),
  userTier: tierSchema.optional(),
  imageNotes: z.string().trim().max(600).optional().default(''),
  tone: z.enum(['friendly', 'premium', 'playful', 'expert']).optional().default('friendly'),
  language: z.enum(['tr', 'en']).optional().default('tr')
});

const upgradeSchema = z.object({ plan: z.enum(['starter', 'pro']) });

function validate(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const error = new Error('Validation failed');
  error.status = 400;
  error.publicMessage = 'Gönderilen bilgiler eksik veya hatalı.';
  error.details = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
  throw error;
}

module.exports = { generatePostSchema, upgradeSchema, validate };
