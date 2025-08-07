import { redirect } from "next/navigation";

export default function EventsRedirectPage() {
  const today = new Date().toISOString().split("T")[0];
  redirect(`/dashboard/events/${today}/all`);
}
