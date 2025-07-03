"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dispatcher } from "@/types/apiResult.type";
import { ReactNode } from "react";

export function DataTableFooter({
  canUpdate,
  canDelete,
  totalData,
  page,
  setPage,
  limit,
  setLimit,
  totalPages,
  reload,
  selectCount,
  setIsLoading,
  setFormTitle,
  sheetForm,
  t,
}: {
  canUpdate: boolean;
  canDelete: boolean;
  totalData: number;
  page: number;
  setPage: Dispatcher<number>;
  limit: number;
  setLimit: Dispatcher<number>;
  totalPages: number;
  reload: () => void;
  selectCount?: number;
  setIsLoading: Dispatcher<boolean>;
  setFormTitle?: Dispatcher<string>;
  sheetForm?: ReactNode;
  t: (key: string) => string;
}) {
  const dropDownPage = [];
  for (let i = 1; i <= totalPages; i++) {
    dropDownPage.push(
      <DropdownMenuItem
        key={`page-${i}`}
        className={`border-b ${page === i ? "bg-blue-300" : null}`}
        onClick={() => {
          if (i !== page) {
            setIsLoading(true);
            setPage(i);
            reload();
          }
        }}
      >
        {t("page")} {i}
      </DropdownMenuItem>
    );
  }
  const dropdownPerPage = [10, 25, 50, 100];
  return (
    <div className="flex flex-1 w-full max-lg:flex-col lg:flex-row mt-2">
      <div className="flex flex-row space-x-2 max-lg:mb-2">
        <div className="max-lg:flex max-lg:flex-1 ">
          <Button className="h-10 cursor-default bg-gray-600 hover:bg-gray-600 lg:justify-start max-lg:flex max-lg:flex-1">
            <span className="first-letter:uppercase font-bold">
              ({totalData.toLocaleString()}) {t("data_found")}
              <span className="max-lg:hidden"> {selectCount !== null && selectCount !== undefined ? `( | ${selectCount}) ${t("data_selected")}` : null}</span>
            </span>
          </Button>
        </div>
        {(canUpdate || canDelete) && sheetForm && setFormTitle && (
          <>
            {canDelete && (
              <div className="max-lg:flex max-lg:flex-1">
                <Button
                  className="h-10 lg:justify-start max-lg:flex max-lg:flex-1"
                  onClick={() => {
                    setFormTitle("bulkdelete");
                  }}
                  variant={"destructive"}
                  disabled={selectCount === 0}
                >
                  {t("delete")}
                </Button>
              </div>
            )}
            {canUpdate && (
              <div className="max-lg:flex max-lg:flex-1">
                <Button
                  className="h-10 lg:justify-start max-lg:flex max-lg:flex-1"
                  onClick={() => {
                    setFormTitle("update");
                  }}
                  disabled={selectCount !== 1}
                >
                  {t("update")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex flex-1 justify-end space-x-2">
        <Button
          className="h-10 font-bold"
          onClick={() => {
            setIsLoading(true);
            setPage(page - 1);
            reload();
          }}
          disabled={page <= 1}
        >
          <ChevronLeft />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-10 font-bold">
              {t("page")} {page}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>{dropDownPage}</DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-10 font-bold">
              {limit} {t("rows")} Per {t("page")}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-b2">
            {dropdownPerPage.map((item) => {
              return (
                <DropdownMenuItem
                  key={`per-page-${item}`}
                  className={`border-b ${limit === item ? "bg-blue-300" : null}`}
                  onClick={() => {
                    if (item !== page) {
                      setIsLoading(true);
                      setPage(1);
                      setLimit(item);
                      reload();
                    }
                  }}
                >
                  {item} {t("rows")} Per {t("page")}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          className="h-10 font-bold"
          onClick={() => {
            setIsLoading(true);
            setPage(page + 1);
            reload();
          }}
          disabled={page >= totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
