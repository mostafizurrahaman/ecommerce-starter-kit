# ⚡ Drizzle ORM (PostgreSQL) — ELI10 হ্যান্ডবুক (Explain Like I'm 10)

**১০ বছর বয়সীদের মতো পরিষ্কার লজিকে বোঝা Drizzle ORM-এর পূর্ণাঙ্গ ও প্র্যাকটিক্যাল গাইড**

> **ELI10 কী?**  
> এটি কোনো রূপকথার গল্প নয়, আবার কোনো কাঠখোট্টা অ্যাকাডেমিক বইও নয়। তুমি যদি স্মার্টফোন চালাতে পারো এবং ভিডিও গেমের (যেমন Minecraft বা Roblox) বেসিক লজিক বোঝো—তবে এই পুরো ডকুমেন্টটি তোমার কাছে পানির মতো সহজ লাগবে।

---

## সূচিপত্র

1. [Drizzle ORM কী? (গেম কন্ট্রোলারের সহজ উপমা)](#১-drizzle-orm-কী-গেম-কন্ট্রোলারের-সহজ-উপমা)
2. [Local Postgres বনাম Neon DB (নিজের হার্ডডিস্ক বনাম ক্লাউড স্টোরেজ)](#২-local-postgres-বনাম-neon-db)
3. [স্কিমা (Schema): এক্সেল শিটের কলাম তৈরি করা](#৩-স্কিমা-schema-এক্সেল-শিটের-কলাম-তৈরি-করা)
4. [ইনসার্ট (Insert): নতুন রো যোগ করা](#৪-ইনসার্ট-insert-নতুন-রো-যোগ-করা)
5. [সিলেক্ট ও ফিল্টারিং (Select & Filter): এক্সেলের ফিল্টার বাটন](#৫-সিলেক্ট-ও-ফিল্টারিং-select--filter)
6. [রিলেশনাল কুয়েরি (`db.query`): প্লেয়ারের প্রোফাইলসহ ইনভেন্টরি লোড](#৬-রিলেশনাল-কুয়েরি-dbquery)
7. [আপডেট ও ডিলিট (Update & Delete): তথ্য বদলানো ও রো মোছা](#৭-আপডেট-ও-ডিলিট-update--delete)
8. [ট্রানজ্যাকশন ও রো-লকিং (`FOR UPDATE`): কনসার্ট টিকিটের সিট বুকিং](#৮-ট্রানজ্যাকশন-ও-রো-লকিং-for-update)
9. [প্রিপেয়ার্ড স্টেটমেন্ট: গেমিং কীবোর্ডের ম্যাক্রো বাটন](#৯-প্রিপেয়ার্ড-স্টেটমেন্ট-gaming-macro)
10. [Drizzle CLI: কোড থেকে ডাটাবেজে রূপান্তর](#১০-drizzle-cli-কমান্ডস)

---

## ১. Drizzle ORM কী? (গেম কন্ট্রোলারের সহজ উপমা)

- **লজিক**:
  যখন তুমি কম্পিউটারে কোনো গেম খেলো, তুমি স্ক্রিনের ভেতরের কোড পরিবর্তন করো না; তুমি হাতে থাকা **কন্ট্রোলারের বোতাম** চাপো, আর কন্ট্রোলার সেই সিগন্যালকে গেমের ভেতর জাম্প বা ফায়ারে রূপান্তর করে।
- **Drizzle-এর কাজ**:
  PostgreSQL ডাটাবেজ শুধু খাঁটি এসকিউএল (`SQL`) বোঝে। আর তুমি লিখছ আধুনিক `TypeScript` কোড। Drizzle হলো সেই স্মার্ট কন্ট্রোলার—তুমি টাইপস্ক্রিপ্টে কমান্ড দিলে সে কোনো ল্যাগ বা ভারী প্রসেসিং ছাড়াই সরাসরি নিখুঁত SQL বানিয়ে ডাটাবেজকে নিয়ন্ত্রণ করে।

---

## ২. Local Postgres বনাম Neon DB

### বাস্তব তুলনা:

- **Local Postgres (নিজের পেনড্রাইভ / হার্ডডিস্ক)**:
  - সম্পূর্ণ তোমার নিজের কম্পিউটারে চলে।
  - ইন্টারনেট কানেকশন না থাকলেও কোডিং করা যায়। রেসপন্স স্পিড **০ মিলি-সেকেন্ড** (বিদ্যুতের মতো ফাস্ট)।
- **Neon DB (Google Drive / ক্লাউড স্টোরেজ)**:
  - ইন্টারনেটে ক্লাউড সার্ভারে চলে।
  - সুবিধা: কোনো সফটওয়্যার ইনস্টল করা লাগে না, যে কাউকে লিংক দিলে কাজ করে।
  - অসুবিধা: ইন্টারনেট ছাড়া চলে না। আর ৫ মিনিট কোনো কাজ না করলে সার্ভার ব্যাটারি বাঁচানোর জন্য ঘুমিয়ে পড়ে (কোল্ড স্টার্ট), ডাক দিলে জাগতে ১-২ সেকেন্ড ল্যাগ করে।

### ⚠️ Neon DB-তে ট্রানজ্যাকশন কাজ না করার পেছনের সত্য:

- **HTTP মেথড (`neon-http`)**: চিঠি বা এসএমএস পাঠানোর মতো। মেসেজ পাঠালে কাজ শেষ, আগের কানেকশন মনে থাকে না। তাই একসাথে ৩টা কাজ করতে পারে না।
- **WebSocket মেথড (`neon-serverless` বা Local `pg`)**: ডিসকর্ড (Discord) বা ফোনের লাইভ ভয়েস কলের মতো। লাইন চালু থাকে, তাই সব কাজ শেষ না হওয়া পর্যন্ত ডাটাবেজ অপেক্ষা করে।

#### কানেকশন সেটআপ (`src/db/index.ts`):

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Local Postgres অথবা Neon Direct Connection এর জন্য
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

---

## ৩. স্কিমা (Schema): এক্সেল শিটের কলাম তৈরি করা

- **ELI10 কনসেপ্ট**:
  একটি নতুন এক্সেল শিট খুলে ওপরের সারিতে কলামের নাম এবং কোন কলামে কী ধরনের তথ্য বসবে তা লক করে দেওয়া (যেমন: নামের ঘরে শুধু অক্ষর, দামের ঘরে শুধু সংখ্যা)।

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// প্রোডাক্ট টেবিল তৈরি
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(), // ইউনিক আইডি (যেমন গেমের Player ID)
  title: varchar("title", { length: 255 }).notNull(), // পণ্যের নাম
  slug: varchar("slug", { length: 280 }).notNull().unique(), // ওয়েবসাইটের সুন্দর লিংক (ডুপ্লিকেট হবে না)
  description: text("description"), // পণ্যের বিস্তারিত বিবরণ
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), // দাম (যেমন: ১২৫০.০০)
  stockQuantity: integer("stock_quantity").default(0).notNull(), // স্টকে কয়টি আছে
  isFeatured: boolean("is_featured").default(false).notNull(), // স্পেশাল পণ্য কি না (True/False)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

---

## ৪. ইনসার্ট (Insert): নতুন রো যোগ করা

- **ELI10 কনসেপ্ট**:
  এক্সেল শিটে নিচে নতুন একটি খালি রো (Row) বানিয়ে তাতে ডেটা লিখে দেওয়া। আর `.returning()` হলো এন্ট্রি করার সাথে সাথে সেই রো-এর আইডি স্ক্রিনে দেখা।

### ক. সিঙ্গেল ইনসার্ট

```typescript
const [newShoe] = await db
  .insert(products)
  .values({
    title: "Nike Air Jordan 4",
    slug: "nike-air-jordan-4",
    price: "4500.00",
    stockQuantity: 10,
  })
  .returning(); // তৈরি হওয়া নতুন ডেটা সাথে সাথে রিটার্ন করবে

console.log("তৈরি হওয়া প্রোডাক্টের আইডি:", newShoe.id);
```

### খ. বাল্ক ইনসার্ট (একসাথে ১০০টি ডেটা ঢোকানো)

```typescript
await db.insert(products).values([
  {
    title: "T-Shirt Red",
    slug: "t-shirt-red",
    price: "600",
    stockQuantity: 20,
  },
  {
    title: "T-Shirt Blue",
    slug: "t-shirt-blue",
    price: "600",
    stockQuantity: 15,
  },
  {
    title: "T-Shirt Black",
    slug: "t-shirt-black",
    price: "650",
    stockQuantity: 25,
  },
]);
```

### গ. আপসার্ট (Upsert / `ON CONFLICT`): ডুপ্লিকেট হলে আপডেট করো

- **লজিক**: যদি কোনো কাস্টমার একই নামে দুইবার প্রোফাইল সেভ করতে চায়, তবে নতুন রো তৈরি করে এরর না দিয়ে পুরানো রো-এর ডাটা আপডেট করে দাও।

```typescript
await db
  .insert(siteSettings)
  .values({ key: "theme_color", value: { primary: "#1e40af" } })
  .onConflictDoUpdate({
    target: siteSettings.key,
    set: { value: { primary: "#1e40af" }, updatedAt: new Date() },
  });
```

---

## ৫. সিলেক্ট ও ফিল্টারিং (Select & Filter): এক্সেলের ফিল্টার বাটন

- **ELI10 কনসেপ্ট**:
  এক্সেলে ফিল্টার অপশন অন করে নির্দিষ্ট কন্ডিশন দেওয়া (যেমন: দাম > ১০০০ টাকা, এবং স্টকে আছে)।

```typescript
import {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  ilike,
  inArray,
  between,
  and,
  or,
  desc,
} from "drizzle-orm";

// ১. শর্ত অনুযায়ী ফিল্টার
const filteredProducts = await db
  .select()
  .from(products)
  .where(
    and(
      gt(products.price, "1000"), // দাম ১০০০ টাকার বেশি
      gte(products.stockQuantity, 1), // স্টকে কমপক্ষে ১টি আছে
      ilike(products.title, "%sneaker%"), // নামের যেকোনো জায়গায় 'sneaker' লেখা আছে (Search)
    ),
  )
  .orderBy(desc(products.createdAt)) // নতুন পণ্যগুলো আগে দেখাবে
  .limit(10) // পেজের জন্য প্রথম ১০টি
  .offset(0);
```

---

## ৬. রিলেশনাল কুয়েরি (`db.query`): প্লেয়ারের প্রোফাইলসহ ইনভেন্টরি লোড

- **ELI10 কনসেপ্ট**:
  যেকোনো মাল্টিপ্লেয়ার গেমে যখন তুমি কারো প্রোফাইল ভিউ করো, তখন তার নাম, লেভেল এবং তার ব্যাগের ভেতরে থাকা সব অস্ত্র ও আইটেম একসাথেই লোড হয়।

```typescript
// ১টি ক্যাটাগরি লোড করলেই তার আন্ডারে থাকা সব সাব-ক্যাটাগরি এবং প্রোডাক্ট একবারে আসবে
const categoryData = await db.query.categories.findFirst({
  where: (categories, { eq }) => eq(categories.slug, "shoes"),
  with: {
    children: true, // সাব-ক্যাটাগরি
    products: {
      // প্রোডাক্টের তালিকা
      limit: 5,
      with: {
        variants: true, // সাইজ ও কালার ভ্যারিয়েন্ট
        images: true, // জুতো বা পণ্যের ছবি
      },
    },
  },
});
```

---

## ৭. আপডেট ও ডিলিট (Update & Delete): তথ্য বদলানো ও রো মোছা

```typescript
import { sql } from "drizzle-orm";

// ১. কোনো পণ্যের দাম পরিবর্তন
await db
  .update(products)
  .set({ price: "4200.00" })
  .where(eq(products.slug, "nike-air-jordan-4"));

// ২. গণিত করে স্টক ১ কমানো (Math Formula)
await db
  .update(products)
  .set({ stockQuantity: sql`${products.stockQuantity} - 1` })
  .where(eq(products.id, "product-uuid-here"));

// ৩. পণ্য ডিলিট করা
await db.delete(products).where(eq(products.slug, "old-discontinued-shoe"));
```

---

## ৮. ট্রানজ্যাকশন ও রো-লকিং (`FOR UPDATE`): কনসার্ট টিকিটের সিট বুকিং

- **লজিক**:
  মনে করো জনপ্রিয় কোনো কনসার্টের **লাস্ট ১টি ভিআইপি সিট** বাকি আছে। দুই ব্যক্তি একই সাথে ওয়েবসাইটে ক্লিক করেছে সিট কেনার জন্য।
  - যদি রো-লক না থাকে: দুইজনের কাছ থেকেই টাকা কেটে নেবে, কিন্তু টিকিট পাবে একজন!
  - **রো-লক (`FOR UPDATE`) সমাধান**:
    প্রথম যে ক্লিক করবে, সিস্টেম ওই ১ সেকেন্ডের জন্য সিটটি নিজের নিয়ন্ত্রণে **লক** করে রাখবে। তার পেমেন্ট শেষ হলে সিট 'বিক্রি' হয়ে যাবে। দ্বিতীয় ব্যক্তি সাথে সাথে এরর দেখতে পাবে: _"দুঃখিত! সিটটি বিক্রি হয়ে গেছে।"_

### Drizzle-এ এই সেফটি কোড:

```typescript
export async function buyShoeAtomic(variantId: string, quantityToBuy: number) {
  return await db.transaction(async (tx) => {
    // ধাপ ১: সিট/স্টক লক করা (অন্য কেউ এখন এটি কিনতে পারবে না)
    const [item] = await tx
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .for('update'); // 🔒 রো লক

    if (!item || item.stockQuantity < quantityToBuy) {
      throw new Error('স্টক শেষ! অন্য কেউ এইমাত্র কিনে ফেলেছে।'); // রোলব্যাক (টাকা কাটবে না)
    }

    // ধাপ ২: স্টক থেকে কমানো
    await tx
      .update(productVariants)
      .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${quantityToBuy}` })
      .where(eq(productVariants.id, variantId));

    // ধাপ ৩: অর্ডার তৈরি করা
    const [order] = await tx.insert(orders).values(...).returning();
    return order;
  });
}
```

---

## ৯. প্রিপেয়ার্ড স্টেটমেন্ট: গেমিং কীবোর্ডের ম্যাক্রো বাটন

- **ELI10 কনসেপ্ট**:
  গেমিং কীবোর্ডে ম্যাক্রো কি (Macro Key) যেমন—একটা বাটন চাপলে ৫টা কমান্ড নিজে নিজেই এক মিলি-সেকেন্ডে ফায়ার হয়। প্রিপেয়ার্ড স্টেটমেন্ট ঠিক তেমনি ডাটাবেজে কুয়েরি প্ল্যান আগে থেকেই রেডি রাখে, ফলে ৩ গুণ দ্রুত ডেটা ফেরত আসে।

```typescript
import { sql } from "drizzle-orm";

// ১. একবার বানিয়ে রেডি রাখা হলো (ম্যাক্রো)
const getProductBySlug = db
  .select()
  .from(products)
  .where(eq(products.slug, sql.placeholder("targetSlug")))
  .prepare("get_product_by_slug");

// ২. সুপারফাস্ট এক্সিকিউশন
const product1 = await getProductBySlug.execute({ targetSlug: "nike-air" });
const product2 = await getProductBySlug.execute({ targetSlug: "adidas-samba" });
```

---

## ১০. Drizzle CLI কমান্ডস

কোড লেখার পর ডাটাবেজ আপডেট করার জন্য নিচের ৪টি কমান্ড মুখস্থ রাখুন:

```bash
# ১. কোড দেখে এসকিউএল মাইগ্রেশন ফাইল তৈরি
npx drizzle-kit generate

# ২. আসল ডাটাবেজে সেই টেবিলগুলো তৈরি করা
npx drizzle-kit migrate

# ৩. লোকাল টেস্টে দ্রুত পুশ করা
npx drizzle-kit push

# ৪. ব্রাউজারে এক্সেল শিটের মতো চোখের সামনে সম্পূর্ণ ডাটাবেজ দেখা
npx drizzle-kit studio
```
