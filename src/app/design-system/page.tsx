"use client";

import {
  Bell,
  CreditCard,
  FileText,
  Home,
  Inbox,
  Mail,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { notFound } from "next/navigation";
import * as React from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SidebarNav } from "@/components/shared/sidebar-nav";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border flex flex-col gap-4 border-b py-10 first:pt-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-h5 text-foreground">{title}</h2>
        {description && <p className="text-body-sm text-foreground-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Reads the swatch's real value out of the rendered element rather than
 * taking it as a prop. Hardcoded hex labels here drifted from globals.css
 * the moment the palette changed (they still advertised the old blue accent
 * after the Stage 14 dark swap), and they duplicated a value the token layer
 * already owns — the rule is one hex, one place.
 */
function Swatch({ name, className }: { name: string; className: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).backgroundColor);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <div ref={ref} className={`border-border h-16 w-full rounded-md border ${className}`} />
      <p className="text-body-sm text-foreground font-medium">{name}</p>
      <p className="text-caption text-foreground-tertiary">{value}</p>
    </div>
  );
}

function ButtonPlayground() {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Button
      isLoading={isLoading}
      onClick={() => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
      }}
    >
      Натисніть для завантаження
    </Button>
  );
}

function ToastPlayground() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Збережено", description: "Зміни успішно збережено." })}
      >
        Default
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({ variant: "success", title: "Готово", description: "Меню опубліковано." })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({ variant: "error", title: "Помилка", description: "Не вдалося зберегти зміни." })
        }
      >
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: "warning",
            title: "Увага",
            description: "Залишилось 2 безкоштовних меню.",
          })
        }
      >
        Warning
      </Button>
    </div>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [checked, setChecked] = React.useState(true);
  const [switchOn, setSwitchOn] = React.useState(true);

  return (
    <main className="pb-24">
      <Container>
        <PageHeader
          title="Design System"
          description="Жива документація UI-компонентів MenuMaker AI. Доступна лише в development-режимі."
          breadcrumbs={[{ label: "Головна", href: "/" }, { label: "Design System" }]}
        />

        <Section title="Кольори" description="Акцентна, нейтральна та семантичні палітри.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            <Swatch name="accent-200" className="bg-accent-200" />
            <Swatch name="accent-300" className="bg-accent-300" />
            <Swatch name="accent-400 (text/icons)" className="bg-accent-400" />
            <Swatch name="accent-500 (brand fill)" className="bg-accent-500" />
            <Swatch name="accent-600 (button, AA)" className="bg-accent-600" />
            <Swatch name="accent-900" className="bg-accent-900" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
            <Swatch name="neutral-0" className="bg-neutral-0" />
            <Swatch name="neutral-300 (2nd text)" className="bg-neutral-300" />
            <Swatch name="neutral-400 (muted)" className="bg-neutral-400" />
            <Swatch name="neutral-600 (border+)" className="bg-neutral-600" />
            <Swatch name="neutral-700 (border)" className="bg-neutral-700" />
            <Swatch name="neutral-850 (card)" className="bg-neutral-850" />
            <Swatch name="neutral-950 (page)" className="bg-neutral-950" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Swatch name="success-400" className="bg-success-400" />
            <Swatch name="error-400" className="bg-error-400" />
            <Swatch name="warning-400" className="bg-warning-400" />
          </div>
        </Section>

        <Section title="Типографіка" description="Модульна шкала (~1.25), base 16px.">
          <div className="flex flex-col gap-3">
            <p className="text-h1 text-foreground">H1 Заголовок 60px</p>
            <p className="text-h2 text-foreground">H2 Заголовок 48px</p>
            <p className="text-h3 text-foreground">H3 Заголовок 36px</p>
            <p className="text-h4 text-foreground">H4 Заголовок 30px</p>
            <p className="text-h5 text-foreground">H5 Заголовок 24px</p>
            <p className="text-h6 text-foreground">H6 Заголовок 20px</p>
            <p className="text-body-lg text-foreground">Body Large 18px — для вступних абзаців.</p>
            <p className="text-body text-foreground">Body 16px — основний текст інтерфейсу.</p>
            <p className="text-body-sm text-foreground">
              Body Small 14px — другорядний текст, підписи полів.
            </p>
            <p className="text-caption text-foreground-tertiary">Caption 12px — мітки, метадані.</p>
          </div>
        </Section>

        <Section title="Buttons" description="4 варіанти × 3 розміри × стани.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">
                Primary sm
              </Button>
              <Button variant="primary" size="md">
                Primary md
              </Button>
              <Button variant="primary" size="lg">
                Primary lg
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <ButtonPlayground />
              <Button variant="primary">
                <Plus className="size-4" aria-hidden="true" />З іконкою
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">draft</Badge>
            <Badge variant="accent">processing</Badge>
            <Badge variant="success">completed</Badge>
            <Badge variant="warning">pending</Badge>
            <Badge variant="error">failed</Badge>
          </div>
        </Section>

        <Section title="Форми" description="Input, Textarea, Select, Checkbox, Radio, Switch.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Email" placeholder="you@example.com" leftIcon={<Mail />} />
            <Input label="Пошук" placeholder="Пошук меню…" rightIcon={<Search />} />
            <Input
              label="Назва меню"
              defaultValue="Літнє меню 2026"
              helperText="Видима гостям назва."
              required
            />
            <Input label="Обов'язкове поле" error="Це поле обов'язкове." />
            <Input label="Недоступне поле" disabled defaultValue="Недоступно для редагування" />
            <Textarea
              label="Опис страви"
              placeholder="Соковитий бургер з чеддером…"
              helperText="До 300 символів."
            />
            <Select
              label="Шаблон меню"
              placeholder="Оберіть шаблон"
              options={[
                { value: "coffee-shop", label: "Coffee Shop" },
                { value: "restaurant", label: "Restaurant" },
                { value: "luxury", label: "Luxury" },
                { value: "dark", label: "Dark" },
              ]}
            />
            <Select
              label="Некоректний вибір"
              placeholder="Оберіть валюту"
              error="Оберіть валюту зі списку."
              options={[
                { value: "usd", label: "USD" },
                { value: "eur", label: "EUR" },
                { value: "uah", label: "UAH" },
              ]}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Checkbox
                label="Публічне меню"
                description="Доступне за посиланням без авторизації"
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />
              <Checkbox label="Вимкнено" disabled />
            </div>
            <RadioGroup defaultValue="web">
              <RadioGroupItem value="web" label="Веб-меню" description="QR-код + посилання" />
              <RadioGroupItem value="pdf" label="PDF" description="Для друку" />
              <RadioGroupItem value="both" label="Обидва" />
            </RadioGroup>
            <div className="flex flex-col gap-3">
              <Switch label="Показувати ціни" checked={switchOn} onCheckedChange={setSwitchOn} />
              <Switch label="Вимкнено" disabled />
            </div>
          </div>
        </Section>

        <Section title="Card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Літнє меню 2026</CardTitle>
                <CardDescription>Оновлено 3 години тому · 24 позиції</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="success">completed</Badge>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Редагувати
                </Button>
                <Button size="sm" variant="ghost">
                  Переглянути
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Меню кав&apos;ярні</CardTitle>
                <CardDescription>Чернетка · 8 позицій</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="neutral">draft</Badge>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Продовжити
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Dialog / Modal">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Відкрити модалку</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Видалити меню?</DialogTitle>
                <DialogDescription>
                  Цю дію неможливо скасувати. Меню та всі пов&apos;язані експорти буде видалено
                  назавжди.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Скасувати</Button>
                </DialogClose>
                <Button variant="destructive">Видалити</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Tooltip">
          <div className="flex gap-4">
            <Tooltip content="Редагувати меню">
              <Button variant="ghost" size="sm">
                <Settings className="size-4" aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip content="Це посилання доступне лише авторизованим користувачам" side="right">
              <span className="text-body-sm text-foreground-secondary underline decoration-dotted">
                Наведіть для підказки
              </span>
            </Tooltip>
          </div>
        </Section>

        <Section title="Toast" description="Системні сповіщення (успіх/помилка/попередження).">
          <ToastPlayground />
        </Section>

        <Section title="Skeleton / Spinner">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="text-accent-400 flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Огляд</TabsTrigger>
              <TabsTrigger value="settings">Налаштування</TabsTrigger>
              <TabsTrigger value="danger">Небезпечна зона</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-body-sm text-foreground-secondary">
                Загальна інформація про меню.
              </p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-body-sm text-foreground-secondary">
                Налаштування видимості та мови.
              </p>
            </TabsContent>
            <TabsContent value="danger">
              <p className="text-body-sm text-foreground-secondary">
                Видалення меню та пов&apos;язаних даних.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Дії ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Меню</DropdownMenuLabel>
              <DropdownMenuItem>
                <FileText className="size-4" aria-hidden="true" />
                Дублювати
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" aria-hidden="true" />
                Налаштування
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <Trash2 className="size-4" aria-hidden="true" />
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar name="Олена Коваль" size="sm" />
            <Avatar name="Олена Коваль" size="md" />
            <Avatar name="Олена Коваль" size="lg" />
            <Avatar
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&h=128&fit=crop"
              name="Іван Петренко"
              size="md"
            />
            <Avatar name="?" size="md" />
          </div>
        </Section>

        <Section title="EmptyState">
          <EmptyState
            icon={Inbox}
            title="У вас ще немає меню"
            description="Створіть перше меню з PDF, DOCX або вручну — це займе кілька хвилин."
            action={
              <Button>
                <Plus className="size-4" aria-hidden="true" />
                Створити меню
              </Button>
            }
          />
        </Section>

        <Section
          title="Sidebar navigation"
          description="Структурна заготовка — реальні пункти меню додаються на Етапі 8."
        >
          <div className="border-border overflow-hidden rounded-lg border">
            <SidebarNav
              className="border-r-0"
              items={[
                { label: "Головна", href: "#home", icon: Home, active: true },
                { label: "Меню", href: "#menus", icon: FileText },
                { label: "Кредити", href: "#credits", icon: CreditCard },
                { label: "Сповіщення", href: "#notifications", icon: Bell },
                { label: "Профіль", href: "#profile", icon: User },
              ]}
            />
          </div>
        </Section>
      </Container>
    </main>
  );
}
