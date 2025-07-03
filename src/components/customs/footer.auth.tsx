import { APP_NAME } from "@/constants/env";

export default function FooterAuth() {
  return (
    <footer className="flex w-full items-center border-b justify-end p-2 bg-black text-white">
      <div className="p-2 items-center">
        {APP_NAME} &copy; {new Date().getFullYear()} All rights reserved
      </div>
    </footer>
  );
}
