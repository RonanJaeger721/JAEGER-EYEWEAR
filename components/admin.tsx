"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  Save,
  Upload,
  Package,
  ShoppingBag,
  LayoutDashboard,
  Layers,
  Users,
  Settings as SettingsIcon,
  FileText,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { api, money, Modal } from "./store-provider";
import { OrderList } from "./customer-pages";
import type {
  Product,
  Collection,
  Settings,
  Order,
  User,
  State,
} from "@/lib/types";
type AdminData = {
  products: Product[];
  collections: Collection[];
  settings: Settings;
  orders: Order[];
  customers: Omit<User, "password">[];
  subscribers: State["subscribers"];
  messages: State["messages"];
  audit: State["audit"];
  role: string;
  storageReady: boolean;
};
const tabs = [
  ["Overview", LayoutDashboard],
  ["Products", Package],
  ["Orders", ShoppingBag],
  ["Collections", Layers],
  ["Website content", FileText],
  ["Customers", Users],
  ["Settings", SettingsIcon],
] as const;
function ImageField({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="image-field">
      <label>
        {label}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/… or uploaded image URL"
        />
      </label>
      <label className="button outline upload-label">
        <Upload size={15} />
        {busy ? "Uploading…" : "Upload photograph"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            try {
              const f = new FormData();
              f.set("file", file);
              const r = await fetch("/api/upload", { method: "POST", body: f });
              const data = await r.json();
              if (!r.ok) throw new Error(data.error);
              onChange(data.url);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      {value && <img src={value} alt="Selected image preview" />}
    </div>
  );
}
export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null),
    [tab, setTab] = useState("Overview"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [product, setProduct] = useState<Product | null>(null),
    [collection, setCollection] = useState<Collection | null>(null),
    [saving, setSaving] = useState(false),
    [search, setSearch] = useState("");
  const load = () =>
    api("admin")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (path: string, value: unknown) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api("admin/" + path, value);
      await load();
      setMessage("Saved successfully.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };
  if (!data)
    return (
      <section className="section">
        <h1>Management.</h1>
        <p>{error || "Opening your workspace…"}</p>
        <Link className="button" href="/account?next=/admin">
          Sign in
        </Link>
      </section>
    );
  const paid = data.orders.filter((o) => o.payment === "paid" && !o.test);
  const low = data.products.filter(
    (p) => !p.concept && p.variants.some((v) => v.stock < 5),
  );
  const top = data.products
    .map((p) => ({
      name: p.name,
      count: paid.reduce(
        (n, o) =>
          n +
          o.items
            .filter((l) => l.productId === p.id)
            .reduce((n, l) => n + l.quantity, 0),
        0,
      ),
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <span className="eyebrow">JAEGER EYEWEAR</span>
          <h2>Management.</h2>
        </div>
        <nav aria-label="Store management">
          {tabs
            .filter(
              ([name]) =>
                data.role === "admin" ||
                [
                  "Overview",
                  "Products",
                  "Collections",
                  "Website content",
                ].includes(name),
            )
            .map(([name, Icon]) => (
              <button
                key={name}
                aria-current={tab === name ? "page" : undefined}
                onClick={() => {
                  setTab(name);
                  setSearch("");
                  setMessage("");
                  setError("");
                }}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
        </nav>
        <Link href="/">
          View storefront <ArrowUpRight size={16} />
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/account" })}>
          <LogOut size={16} /> Sign out
        </button>
        <small>
          {data.role.toUpperCase()} ACCESS
          <br />
          Pre-launch workspace
        </small>
      </aside>
      <div className="admin-main">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">STORE / {tab.toUpperCase()}</span>
            <h1>{tab}.</h1>
          </div>
          <span className="status">
            {data.settings.launchApproved ? "Brand approved" : "Pre-launch"}
          </span>
        </div>
        <p className="form-message" role="status">
          {message}
        </p>
        <p className="form-message error" role="alert">
          {error}
        </p>
        {tab === "Overview" && (
          <>
            <div className="metrics">
              <div>
                <small>Total orders</small>
                <strong>{data.orders.length}</strong>
              </div>
              <div>
                <small>Verified revenue (USD)</small>
                <strong>{money(paid.reduce((n, o) => n + o.total, 0))}</strong>
              </div>
              <div>
                <small>Pending payment</small>
                <strong>
                  {
                    data.orders.filter(
                      (o) =>
                        o.payment === "pending_payment" &&
                        Date.parse(o.reservationUntil) > Date.now(),
                    ).length
                  }
                </strong>
              </div>
              <div>
                <small>Low-stock products</small>
                <strong>{low.length}</strong>
              </div>
            </div>
            <div className="notice">
              <h2>Collection 001 / Launch status</h2>
              <p>
                {data.settings.launchApproved
                  ? "Brand approval recorded."
                  : "Brand clearance is pending. Commercial ordering remains gated."}{" "}
                {data.products.filter((p) => p.concept).length} concept
                products. No online payment provider configured.
              </p>
              <p>
                Only independently verified paid orders count as revenue. Test
                orders are excluded.
              </p>
            </div>
            <div className="admin-columns">
              <div>
                <h2>Low-stock alerts</h2>
                {low.length ? (
                  low.map((p) => (
                    <p key={p.id}>
                      {p.name}:{" "}
                      {p.variants
                        .map((v) => `${v.color} ${v.stock}`)
                        .join(" / ")}
                    </p>
                  ))
                ) : (
                  <p>No live inventory to report.</p>
                )}
              </div>
              <div>
                <h2>Top-performing products</h2>
                {top.length ? (
                  top.map((p) => (
                    <p key={p.name}>
                      {p.name} · {p.count} units
                    </p>
                  ))
                ) : (
                  <p>Confirmed sales will appear here.</p>
                )}
              </div>
            </div>
            <h2>Recent orders</h2>
            <OrderList orders={data.orders.slice(-5)} />
            <h2>Audit history</h2>
            <div className="audit">
              {data.audit
                .slice(-12)
                .reverse()
                .map((a, i) => (
                  <p key={i}>
                    {new Date(a.at).toLocaleString("en-GB")} · {a.actor} ·{" "}
                    {a.message}
                  </p>
                ))}
            </div>
          </>
        )}
        {tab === "Products" && (
          <>
            <div className="admin-toolbar">
              <input
                aria-label="Search products"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="button"
                onClick={() =>
                  setProduct({
                    id: "frame-" + Date.now(),
                    slug: "frame-" + Date.now(),
                    name: "New frame",
                    category: "sunglasses",
                    shape: "rectangle",
                    description: "",
                    concept: true,
                    verified: false,
                    featured: false,
                    newArrival: false,
                    archived: false,
                    variants: [
                      {
                        id: "variant-" + Date.now(),
                        color: "Black",
                        hex: "#101010",
                        lens: "Unconfirmed",
                        images: ["/media/rectangle-0.svg"],
                        price: null,
                        stock: 0,
                        material: "Unconfirmed",
                      },
                    ],
                  })
                }
              >
                <Plus size={16} />
                Add product
              </button>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Frame</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Variants / stock</th>
                    <th>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products
                    .filter((p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product">
                            <img src={p.variants[0].images[0]} alt="" />
                            {p.name}
                          </div>
                        </td>
                        <td>
                          {p.category}
                          <small>{p.shape}</small>
                        </td>
                        <td>
                          {p.archived
                            ? "Archived"
                            : p.concept
                              ? "Concept"
                              : p.verified
                                ? "Verified"
                                : "Unverified"}
                          {p.featured ? " · Featured" : ""}
                        </td>
                        <td>
                          {p.variants.length} /{" "}
                          {p.variants.reduce((n, v) => n + v.stock, 0)}
                        </td>
                        <td>
                          <button
                            className="underlink"
                            onClick={() => setProduct(structuredClone(p))}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === "Orders" && (
          <>
            <input
              className="admin-search"
              aria-label="Search orders"
              placeholder="Search order ID, customer or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {data.orders
              .filter((o) =>
                (o.id + o.name + o.email)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .reverse()
              .map((o) => (
                <div className="admin-order" key={o.id}>
                  <OrderList orders={[o]} />
                  <p>
                    {o.email} · {o.phone}
                    <br />
                    {o.address}
                  </p>
                  <div className="admin-toolbar">
                    {o.payment === "pending_payment" && (
                      <>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            await save("order", {
                              id: o.id,
                              action: "verify",
                              reference: f.get("reference"),
                            });
                          }}
                        >
                          <label>
                            Verified payment evidence reference
                            <input
                              name="reference"
                              minLength={6}
                              maxLength={200}
                              required
                              placeholder="Bank / merchant transaction reference"
                            />
                          </label>
                          <button className="button" disabled={saving}>
                            Verify received payment
                          </button>
                        </form>
                        <button
                          className="button outline"
                          disabled={saving}
                          onClick={() =>
                            save("order", { id: o.id, action: "cancel" })
                          }
                        >
                          Cancel & release stock
                        </button>
                      </>
                    )}
                    {o.payment === "paid" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          save("order", {
                            id: o.id,
                            action: "fulfil",
                            fulfilment: new FormData(e.currentTarget).get(
                              "fulfilment",
                            ),
                          });
                        }}
                      >
                        <label>
                          Fulfilment
                          <select
                            name="fulfilment"
                            defaultValue={
                              o.fulfilment === "unfulfilled"
                                ? "processing"
                                : o.fulfilment
                            }
                          >
                            <option>processing</option>
                            <option>shipped</option>
                            <option>delivered</option>
                          </select>
                        </label>
                        <button className="button" disabled={saving}>
                          Update fulfilment
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            {!data.orders.length && (
              <div className="empty">
                <h2>No orders yet.</h2>
                <p>Orders will appear here when approved ordering opens.</p>
              </div>
            )}
          </>
        )}
        {tab === "Collections" && (
          <>
            <button
              className="button"
              onClick={() =>
                setCollection({
                  id: "collection-" + Date.now(),
                  name: "New collection",
                  description: "",
                  image: "/media/rectangle-0.svg",
                  products: [],
                  order: data.collections.length,
                })
              }
            >
              <Plus size={16} />
              Add collection
            </button>
            <div className="admin-collections">
              {data.collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCollection(structuredClone(c))}
                >
                  <img src={c.image} alt="" />
                  <strong>{c.name}</strong>
                  <span>
                    {c.products.length} products · Position {c.order}
                  </span>
                  <span>Edit collection ↗</span>
                </button>
              ))}
            </div>
          </>
        )}
        {(tab === "Website content" || tab === "Settings") && (
          <SettingsEditor
            key={tab + data.settings.announcement}
            initial={data.settings}
            content={tab === "Website content"}
            saving={saving}
            save={(s) =>
              save(tab === "Website content" ? "content" : "settings", s)
            }
          />
        )}
        {tab === "Customers" && (
          <>
            <input
              className="admin-search"
              placeholder="Search customer, subscriber or enquiry"
              aria-label="Search customers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <h2>Accounts</h2>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers
                    .filter((c) =>
                      (c.name + c.email)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>
                          {data.orders.filter((o) => o.userId === c.id).length}
                        </td>
                        <td>{c.role}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <h2>Newsletter consent</h2>
            {data.subscribers
              .filter((s) => s.email.includes(search))
              .map((s) => (
                <div className="subscriber" key={s.email}>
                  <span>
                    {s.email}
                    <small>
                      Consent: {new Date(s.consentAt).toLocaleString("en-GB")}
                    </small>
                  </span>
                  <span>{s.active ? "Subscribed" : "Unsubscribed"}</span>
                  {s.active && (
                    <button
                      className="underlink"
                      onClick={() =>
                        save("subscriber", { email: s.email, active: false })
                      }
                    >
                      Unsubscribe
                    </button>
                  )}
                </div>
              ))}
            <h2>Enquiries</h2>
            {data.messages
              .filter((m) =>
                (m.email + m.name + m.message)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((m) => (
                <article className="notice" key={m.id}>
                  <strong>
                    {m.name} · {m.email}
                  </strong>
                  <p>{m.message}</p>
                  <small>{new Date(m.createdAt).toLocaleString("en-GB")}</small>
                  <a className="underlink" href={`mailto:${m.email}`}>
                    Reply by email ↗
                  </a>
                </article>
              ))}
          </>
        )}
      </div>
      {product && (
        <Modal title="EDIT PRODUCT" drawer onClose={() => setProduct(null)}>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <ProductEditor
            initial={product}
            saving={saving}
            save={async (p) => {
              if (await save("product", p)) setProduct(null);
            }}
          />
        </Modal>
      )}
      {collection && (
        <Modal
          title="EDIT COLLECTION"
          drawer
          onClose={() => setCollection(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await save("collection", collection)) setCollection(null);
            }}
          >
            <label>
              Name
              <input
                value={collection.name}
                onChange={(e) =>
                  setCollection({ ...collection, name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={collection.description}
                onChange={(e) =>
                  setCollection({ ...collection, description: e.target.value })
                }
              />
            </label>
            <label>
              Display order
              <input
                type="number"
                min="0"
                value={collection.order}
                onChange={(e) =>
                  setCollection({
                    ...collection,
                    order: Number(e.target.value),
                  })
                }
              />
            </label>
            <ImageField
              value={collection.image}
              onChange={(url) => setCollection({ ...collection, image: url })}
            />
            <fieldset>
              <legend>Assigned products</legend>
              {data.products.map((p) => (
                <label className="check" key={p.id}>
                  <input
                    type="checkbox"
                    checked={collection.products.includes(p.id)}
                    onChange={(e) =>
                      setCollection({
                        ...collection,
                        products: e.target.checked
                          ? [...collection.products, p.id]
                          : collection.products.filter((id) => id !== p.id),
                      })
                    }
                  />
                  {p.name}
                </label>
              ))}
            </fieldset>
            <button className="button full" disabled={saving}>
              <Save size={16} />
              Save collection
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ProductEditor({
  initial,
  save,
  saving,
}: {
  initial: Product;
  save: (p: Product) => void;
  saving: boolean;
}) {
  const [p, setP] = useState(initial);
  const update = (key: string, value: unknown) => setP({ ...p, [key]: value });
  return (
    <form
      className="product-editor"
      onSubmit={(e) => {
        e.preventDefault();
        save(p);
      }}
    >
      <label>
        Product name
        <input
          value={p.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </label>
      <label>
        URL slug
        <input
          value={p.slug}
          onChange={(e) => update("slug", e.target.value)}
          pattern="[a-z0-9-]+"
          required
        />
      </label>
      <div className="form-row">
        <label>
          Category
          <select
            value={p.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="sunglasses">Sunglasses</option>
            <option value="optical">Optical</option>
          </select>
        </label>
        <label>
          Frame shape
          <input
            value={p.shape}
            onChange={(e) => update("shape", e.target.value)}
            required
            list="shapes"
          />
          <datalist id="shapes">
            {[
              "rectangle",
              "square",
              "aviator",
              "cat-eye",
              "oval",
              "oversized",
              "statement",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </datalist>
        </label>
      </div>
      <label>
        Description
        <textarea
          rows={4}
          value={p.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>
      {[
        ["concept", "Concept / not for sale"],
        ["verified", "Supplier & imagery verified"],
        ["featured", "Featured on homepage"],
        ["newArrival", "New arrival"],
        ["archived", "Archive product"],
      ].map(([key, label]) => (
        <label className="check" key={key}>
          <input
            type="checkbox"
            checked={p[key as keyof Product] as boolean}
            onChange={(e) => update(key, e.target.checked)}
          />
          {label}
        </label>
      ))}
      <h3>Variants</h3>
      {p.variants.map((v, i) => (
        <fieldset key={v.id}>
          <legend>
            Variant {i + 1} — {v.color}
          </legend>
          <label>
            Frame colour
            <input
              value={v.color}
              onChange={(e) =>
                update(
                  "variants",
                  p.variants.map((x, j) =>
                    j === i ? { ...x, color: e.target.value } : x,
                  ),
                )
              }
              required
            />
          </label>
          <div className="form-row">
            <label>
              Swatch
              <input
                type="color"
                value={v.hex}
                onChange={(e) =>
                  update(
                    "variants",
                    p.variants.map((x, j) =>
                      j === i ? { ...x, hex: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Price USD (blank = unconfirmed)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={v.price === null ? "" : v.price / 100}
                onChange={(e) =>
                  update(
                    "variants",
                    p.variants.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            price:
                              e.target.value === ""
                                ? null
                                : Math.round(Number(e.target.value) * 100),
                          }
                        : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={v.stock}
                onChange={(e) =>
                  update(
                    "variants",
                    p.variants.map((x, j) =>
                      j === i ? { ...x, stock: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
            </label>
          </div>
          {(["lens", "material", "uv"] as const).map((key) => (
            <label key={key}>
              {key === "uv"
                ? "Verified UV / standard information (optional)"
                : key}
              <input
                value={v[key] || ""}
                onChange={(e) =>
                  update(
                    "variants",
                    p.variants.map((x, j) =>
                      j === i ? { ...x, [key]: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
          ))}
          <label className="check">
            <input
              type="checkbox"
              checked={!!v.measurements}
              onChange={(e) =>
                update(
                  "variants",
                  p.variants.map((x, j) =>
                    j === i
                      ? {
                          ...x,
                          measurements: e.target.checked
                            ? { lens: 50, bridge: 20, temple: 140 }
                            : undefined,
                        }
                      : x,
                  ),
                )
              }
            />
            Supplier-confirmed measurements available
          </label>
          {v.measurements && (
            <div className="form-row">
              {(["lens", "bridge", "temple"] as const).map((key) => (
                <label key={key}>
                  {key} (mm)
                  <input
                    type="number"
                    value={v.measurements![key]}
                    onChange={(e) =>
                      update(
                        "variants",
                        p.variants.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                measurements: {
                                  ...x.measurements!,
                                  [key]: Number(e.target.value),
                                },
                              }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          )}
          {v.images.map((src, k) => (
            <div key={k}>
              <ImageField
                label={`Photograph ${k + 1}`}
                value={src}
                onChange={(url) =>
                  update(
                    "variants",
                    p.variants.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            images: x.images.map((old, l) =>
                              l === k ? url : old,
                            ),
                          }
                        : x,
                    ),
                  )
                }
              />
              {v.images.length > 1 && (
                <button
                  type="button"
                  className="underlink"
                  onClick={() =>
                    update(
                      "variants",
                      p.variants.map((x, j) =>
                        j === i
                          ? { ...x, images: x.images.filter((_, l) => l !== k) }
                          : x,
                      ),
                    )
                  }
                >
                  Remove photograph
                </button>
              )}
            </div>
          ))}
          <button
            className="underlink"
            type="button"
            onClick={() =>
              update(
                "variants",
                p.variants.map((x, j) =>
                  j === i ? { ...x, images: [...x.images, x.images[0]] } : x,
                ),
              )
            }
          >
            Add gallery photograph +
          </button>
          {p.variants.length > 1 && (
            <button
              type="button"
              className="text-button"
              onClick={() =>
                update(
                  "variants",
                  p.variants.filter((_, j) => j !== i),
                )
              }
            >
              Remove variant
            </button>
          )}
        </fieldset>
      ))}
      <button
        className="button outline full"
        type="button"
        onClick={() =>
          update("variants", [
            ...p.variants,
            {
              id: "variant-" + Date.now(),
              color: "New colour",
              hex: "#101010",
              lens: "Unconfirmed",
              material: "Unconfirmed",
              images: ["/media/rectangle-0.svg"],
              price: null,
              stock: 0,
            },
          ])
        }
      >
        Add variant +
      </button>
      <p className="muted">
        Publish real products only with verified rights, accurate variant
        imagery, confirmed specifications and commercial approval.
      </p>
      <button className="button full" disabled={saving}>
        <Save size={16} />
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
function SettingsEditor({
  initial,
  content,
  saving,
  save,
}: {
  initial: Settings;
  content: boolean;
  saving: boolean;
  save: (s: Settings) => Promise<boolean>;
}) {
  const [s, setS] = useState(initial);
  return (
    <form
      className="settings-editor"
      onSubmit={(e) => {
        e.preventDefault();
        save(s);
      }}
    >
      {content ? (
        <>
          <label>
            Announcement banner
            <input
              value={s.announcement}
              onChange={(e) => setS({ ...s, announcement: e.target.value })}
            />
          </label>
          <label>
            Hero title (line breaks supported)
            <textarea
              value={s.heroTitle}
              onChange={(e) => setS({ ...s, heroTitle: e.target.value })}
            />
          </label>
          <label>
            Hero supporting copy
            <textarea
              value={s.heroCopy}
              onChange={(e) => setS({ ...s, heroCopy: e.target.value })}
            />
          </label>
          <ImageField
            label="Hero campaign"
            value={s.heroImage}
            onChange={(url) => setS({ ...s, heroImage: url })}
          />
          <ImageField
            label="Story campaign image"
            value={s.campaignImage}
            onChange={(url) => setS({ ...s, campaignImage: url })}
          />
          <h2>Frequently asked questions</h2>
          {s.faqs.map((f, i) => (
            <fieldset key={i}>
              <label>
                Question
                <input
                  value={f.question}
                  onChange={(e) =>
                    setS({
                      ...s,
                      faqs: s.faqs.map((x, j) =>
                        i === j ? { ...x, question: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Answer
                <textarea
                  value={f.answer}
                  onChange={(e) =>
                    setS({
                      ...s,
                      faqs: s.faqs.map((x, j) =>
                        i === j ? { ...x, answer: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <button
                type="button"
                className="underlink"
                onClick={() =>
                  setS({ ...s, faqs: s.faqs.filter((_, j) => i !== j) })
                }
              >
                Remove question
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            className="underlink"
            onClick={() =>
              setS({ ...s, faqs: [...s.faqs, { question: "", answer: "" }] })
            }
          >
            Add question +
          </button>
        </>
      ) : (
        <>
          <h2>Business contacts</h2>
          {(["email", "whatsapp", "instagram", "tiktok"] as const).map(
            (key) => (
              <label key={key}>
                {key === "whatsapp"
                  ? "WhatsApp (international digits only)"
                  : key}
                <input
                  value={s[key]}
                  type={key === "email" ? "email" : "text"}
                  onChange={(e) => setS({ ...s, [key]: e.target.value })}
                />
              </label>
            ),
          )}
          <h2>Delivery rules</h2>
          {s.delivery.map((d, i) => (
            <fieldset key={d.id}>
              <label>
                Name
                <input
                  value={d.name}
                  onChange={(e) =>
                    setS({
                      ...s,
                      delivery: s.delivery.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Price USD
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={d.price / 100}
                  onChange={(e) =>
                    setS({
                      ...s,
                      delivery: s.delivery.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              price: Math.round(Number(e.target.value) * 100),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={(e) =>
                    setS({
                      ...s,
                      delivery: s.delivery.map((x, j) =>
                        j === i ? { ...x, enabled: e.target.checked } : x,
                      ),
                    })
                  }
                />
                Enabled
              </label>
            </fieldset>
          ))}
          <button
            type="button"
            className="underlink"
            onClick={() =>
              setS({
                ...s,
                delivery: [
                  ...s.delivery,
                  {
                    id: "delivery-" + Date.now(),
                    name: "New delivery option",
                    price: 0,
                    enabled: false,
                  },
                ],
              })
            }
          >
            Add delivery option +
          </button>
          <h2>Store policies</h2>
          {(["shipping", "returns", "privacy", "terms"] as const).map((key) => (
            <label key={key}>
              {key}
              <textarea
                rows={5}
                value={s[key]}
                onChange={(e) => setS({ ...s, [key]: e.target.value })}
              />
            </label>
          ))}
          <h2>Commercial controls</h2>
          <div className="notice">
            <p>
              Only enable after brand clearance, catalogue verification,
              policies, delivery and payment operations are approved.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={s.launchApproved}
                onChange={(e) =>
                  setS({ ...s, launchApproved: e.target.checked })
                }
              />
              Brand and operational launch approved
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={s.manualOrdersEnabled}
                onChange={(e) =>
                  setS({ ...s, manualOrdersEnabled: e.target.checked })
                }
              />
              Enable manual orders for verified products
            </label>
          </div>
          <p>
            Online payment provider: <strong>Not connected</strong>. Provider
            credentials belong in server environment variables. No card details
            are stored.
          </p>
        </>
      )}
      <button className="button" disabled={saving}>
        <Save size={16} />
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
