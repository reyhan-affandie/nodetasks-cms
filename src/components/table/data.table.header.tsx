"use client";

import { MoveLeft, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export function DataTableHeader({
  tableTitle,
  canCreate,
  api,
  setFormTitle,
  sheetForm,
  search,
  setSearch,
  sheetOpen,
  setSheetOpen,
  setPage,
  setIsLoading,
  reload,
  parents,
  parentData,
  parentField,
  t,
}: {
  tableTitle?: string;
  canCreate: boolean;
  api: string;
  setFormTitle?: Dispatcher<string>;
  sheetForm?: ReactNode;
  search: string;
  setSearch: Dispatcher<string>;
  sheetOpen?: boolean;
  setSheetOpen?: Dispatcher<boolean>;
  setPage: Dispatcher<number>;
  setIsLoading: Dispatcher<boolean>;
  reload: () => void;
  parents?: string;
  parentData?: ApiPayload;
  parentField?: string;
  t: (key: string) => string;
}) {
  const router = useRouter();

  const reloadTable = () => {
    setIsLoading(true);
    setPage(1);
    reload();
  };
  const searchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      reloadTable();
    }
  };
  return (
    <div className="flex flex-col">
      {parentData && parentField && (
        <div className="flex items-center space-x-2 mb-2 max-lg:flex-row">
          <div className="flex flex-1">
            <Button className="h-10 bg-blue-600 hover:bg-blue-600 max-lg:w-full lg:justify-start cursor-pointer" onClick={() => router.push(`/${parents}`)}>
              <span className="font-bold flex">
                <MoveLeft className="mr-2" />
                {parents} : {parentData[parentField] as string}
              </span>
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-2 mb-2 max-lg:flex-row">
        <div className="flex flex-1">
          <Button className="h-10 cursor-default bg-gray-600 hover:bg-gray-600 max-lg:w-full lg:justify-start">
            <span className="font-bold">{tableTitle ? tableTitle : t(api)}</span>
          </Button>
        </div>
        <div className="flex flex-1 justify-end">
          {sheetForm && setFormTitle && setSheetOpen && (
            <Sheet open={sheetOpen}>
              <SheetTrigger asChild className="cursor-pointer">
                {canCreate && (
                  <Button
                    className="h-10 max-lg:w-full lg:w-1/6"
                    onClick={() => {
                      setFormTitle("create");
                      setSheetOpen(true);
                    }}
                  >
                    <span className="font-bold">{t("create")}</span>
                  </Button>
                )}
              </SheetTrigger>
              {sheetForm}
            </Sheet>
          )}
        </div>
      </div>

      <div className="flex flex-1 w-full mb-2">
        <div className="flex flex-1 flex-row space-x-2">
          <div className="max-lg:flex max-lg:flex-1 lg:flex lg:w-1/6">
            <Input
              id="search"
              name="search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              maxLength={255}
              onKeyDown={searchEnter}
              className="border-blue-600 h-10"
            />
          </div>
          <div>
            <Button
              className="h-10"
              onClick={() => {
                reloadTable();
              }}
            >
              <Search />
            </Button>
          </div>
          <div>
            <Button
              className="h-10"
              onClick={() => {
                setSearch("");
                reloadTable();
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
