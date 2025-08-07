"use client";

import React, { ReactNode, useEffect, useState } from "react";

import { ArrowDown, ArrowUp, ArrowUpDown, Database, FileDown, ImageIcon, Settings } from "lucide-react";
import { ApiPayload, Dispatcher, SubModules, TableKeyType } from "@/types/apiResult.type";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableHeader } from "@/components/table/data.table.header";
import { DataTableFooter } from "@/components/table/data.table.footer";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { AlertResponse } from "@/components/table/data.table.message";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/constants/env";
import { Switch } from "@/components/ui/switch";
import { updateField } from "@/actions/actions";
import { toastMessage } from "@/components/customs/toast.message";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAuthUser } from "@/actions/auth.actions";
import { buildFeatureAccessMap } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function DataTableUI({
  api,
  columns,
  sheetForm,
  setFormTitle,
  setSelectedDataId,
  errorStatus,
  errorMessage,
  setIsLoading,
  reload,

  data,
  setData,

  page,
  setPage,

  sort,
  setSort,
  order,
  setOrder,

  totalData,
  totalPages,

  limit,
  setLimit,

  search,
  setSearch,

  sheetOpen,
  setSheetOpen,

  selectCount,
  setSelectCount,

  selectedDataIds,
  setSelectedDataIds,

  selectedDataDescriptions,
  setSelectedDataDescriptions,

  parent,
  parents,
  parentData,
  parentField,
  subModules,

  tableTitle,
}: {
  api: string;
  columns: TableKeyType[];
  sheetForm?: ReactNode;
  setFormTitle: Dispatcher<string>;
  setSelectedDataId: Dispatcher<number>;
  errorStatus: number;
  errorMessage: string;
  setIsLoading: Dispatcher<boolean>;
  reload: () => void;

  data: Array<ApiPayload>;
  setData: Dispatcher<Array<ApiPayload>>;

  page: number;
  setPage: Dispatcher<number>;

  sort: string;
  setSort: Dispatcher<string>;
  order: string;
  setOrder: Dispatcher<string>;

  totalData: number;
  totalPages: number;

  limit: number;
  setLimit: Dispatcher<number>;

  search: string;
  setSearch: Dispatcher<string>;

  sheetOpen: boolean;
  setSheetOpen: Dispatcher<boolean>;

  selectCount: number;
  setSelectCount: Dispatcher<number>;

  selectedDataIds: Array<number>;
  setSelectedDataIds: Dispatcher<Array<number>>;

  selectedDataDescriptions: Array<string>;
  setSelectedDataDescriptions: Dispatcher<Array<string>>;

  parent?: string;
  parents?: string;
  parentData?: ApiPayload;
  parentField?: string;
  subModules?: SubModules[];

  tableTitle?: string;
}) {
  const [user, setUser] = useState<ApiPayload | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAuthUser();
        setUser(res?.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
    };
    fetchData();
  }, []);
  const featureMap = buildFeatureAccessMap(user);

  const canCreate = featureMap?.[api]?.privilegeCreate === true;
  const canRead = featureMap?.[api]?.privilegeRead === true;
  const canUpdate = featureMap?.[api]?.privilegeUpdate === true;
  const canDelete = featureMap?.[api]?.privilegeDelete === true;
  const showActions = canRead || canUpdate || canDelete;

  const canCreateSub: Record<string, boolean> = {};
  const canReadSub: Record<string, boolean> = {};
  const canUpdateSub: Record<string, boolean> = {};
  const canDeleteSub: Record<string, boolean> = {};
  const showActionsSub: Record<string, boolean> = {};

  if (subModules?.length) {
    for (const { key } of subModules) {
      canCreateSub[key] = featureMap?.[key]?.privilegeCreate === true;
      canReadSub[key] = featureMap?.[key]?.privilegeRead === true;
      canUpdateSub[key] = featureMap?.[key]?.privilegeUpdate === true;
      canDeleteSub[key] = featureMap?.[key]?.privilegeDelete === true;
      showActionsSub[key] = canReadSub[key] || canUpdateSub[key] || canDeleteSub[key];
    }
  }

  const t = useTranslations();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handlePreviewImage = (value: string) => {
    setPreviewImage(`${API_URL}/${value}`);
  };

  const handleDownloadFile = (value: string) => {
    const fileUrl = `${API_URL}/${value}`;
    window.open(fileUrl, "_blank");
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedData = data.map((item) => ({ ...item, x: !checked })) as typeof data;
    const selectedIds = !checked ? updatedData.map((item) => Number(item.id)) : [];
    const selectedDescriptions = !checked
      ? updatedData.map((item) => (item.name ? String(item.name) : item.from ? String(item.from) : item.title ? String(item.title) : ""))
      : [];

    setData(updatedData);
    setSelectedDataIds(selectedIds);
    setSelectedDataDescriptions(selectedDescriptions);
    setSelectCount(!checked ? updatedData.length : 0);
  };

  const handleRowSelect = (checked: boolean, id: number) => {
    const updatedData = data.map((item) => (item.id === id ? { ...item, x: checked } : item));

    const updatedSelectedIds = checked ? [...selectedDataIds, id] : selectedDataIds.filter((itemId) => itemId !== id);

    const updatedSelectedDescriptions = checked
      ? [
          ...selectedDataDescriptions,
          updatedData.find((item) => item.id === id)?.name ||
            updatedData.find((item) => item.id === id)?.from ||
            updatedData.find((item) => item.id === id)?.title ||
            "",
        ]
      : selectedDataDescriptions.filter(
          (desc) =>
            desc !==
            (updatedData.find((item) => item.id === id)?.name ||
              updatedData.find((item) => item.id === id)?.from ||
              updatedData.find((item) => item.id === id)?.title)
        );

    setData(updatedData);
    setSelectedDataIds(updatedSelectedIds);
    setSelectedDataDescriptions(updatedSelectedDescriptions.map(String));

    setSelectCount(updatedSelectedIds.length);
    if (updatedSelectedIds.length === 1) {
      setSelectedDataId(updatedSelectedIds[0]);
    }
  };

  const handleUpdateField = async (api: string, id: number, checked: boolean, field: string = "status") => {
    try {
      const url = api + "/" + field;
      const res = await updateField(url, id, field, checked);
      if (res.error === false) {
        setData((prevData) => prevData.map((item) => (item.id === id ? { ...item, [field]: checked } : item)));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setData((prevData) => prevData.map((item) => (item.id === id ? { ...item, [field]: !checked } : item)));
      toastMessage({
        api: api,
        variant: "destructive",
        status: 500,
        statusText: "Unknown error, please contact our customer support. thank you",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  const formatNumericValue = (value: unknown): string => {
    if (typeof value === "number" || typeof value === "bigint") {
      return Number(value).toLocaleString("id-ID");
    }

    if (typeof value === "string" && /^[0-9]+$/.test(value)) {
      return Number(value).toLocaleString("id-ID");
    }

    return String(value);
  };

  function PriorityBadge({ value }: { value: string }) {
    const v = value?.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    if (v === "high") variant = "destructive";
    else if (v === "medium") variant = "default";
    else if (v === "low") variant = "secondary";
    else variant = "outline"; // for unexpected values

    return <Badge variant={variant}>{value}</Badge>;
  }

  const pathname = usePathname();

  const handlePreviewEvent = (item: ApiPayload) => {
    const userId = item.userId as number;
    const dataDate = item.dataDate as string;
    if (!userId || !dataDate) return;

    const formattedDate = new Date(dataDate).toISOString().split("T")[0];
    const localePrefix = pathname.split("/")[1]; // e.g., "en"
    const basePath = `/${localePrefix}/dashboard/events`;

    router.push(`${basePath}/${formattedDate}/${userId}`);
  };

  return (
    <>
      {previewImage && (
        <Dialog open onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <div className="relative">
              <Image src={previewImage} alt="Preview" width={600} height={600} className="object-contain max-h-[80vh] max-w-[80vw] rounded-md" />
            </div>
          </DialogContent>
        </Dialog>
      )}
      <DataTableHeader
        tableTitle={tableTitle}
        canCreate={canCreate}
        api={api}
        setFormTitle={setFormTitle}
        sheetForm={sheetForm}
        search={search}
        setSearch={setSearch}
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        setPage={setPage}
        setIsLoading={setIsLoading}
        reload={reload}
        parents={parents}
        parentData={parentData}
        parentField={parentField}
        t={t}
      />
      <div className="overflow-x-auto overflow-y-auto relative">
        <ContextMenu onOpenChange={setOpen}>
          <ContextMenuTrigger asChild>
            <Table className="border rounded-md w-full">
              <TableHeader className="bg-gray-600 sticky top-0 z-40">
                <TableRow className="hover:bg-inherit">
                  <TableHead className="text-white">
                    <Checkbox className="bg-blue-50" onCheckedChange={(checked) => handleSelectAll(checked as boolean)} />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={`${sort === column.key ? "text-yellow-400" : "text-white"}`}>
                      {column.sort ? (
                        <Button
                          variant="ghost"
                          className={`m-0 p-0 hover:bg-inherit hover:text-yellow-400 `}
                          onClick={() => {
                            setSort(column.key);
                            setOrder(order === "asc" ? "desc" : "asc");
                            reload();
                          }}
                        >
                          {column.label}
                          {column.key === sort ? order === "asc" ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown size={16} />}
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  ))}
                  {showActions && <TableHead className="text-white">{t("actions")}</TableHead>}
                  {subModules && subModules.length > 0 && Object.values(showActionsSub).some(Boolean) && (
                    <TableHead className="text-white">{t("modules")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow
                      key={item.id as number}
                      className={item.x ? "bg-gray-400 text-white hover:bg-gray-400 hover:text-white" : "even:bg-blue-200 hover:bg-gray-400 hover:text-white"}
                    >
                      <TableCell>
                        <Checkbox checked={item.x as boolean} onCheckedChange={(checked) => handleRowSelect(checked as boolean, item.id as number)} />
                      </TableCell>
                      {columns.map((column) => {
                        const value = getNestedValue(item, column.key);
                        if (column.key === "id" || column.key === "x" || column.key === parent || column.key === `${parent}Id`) return null;

                        return (
                          <TableCell
                            key={column.key}
                            className="cursor-pointer"
                            onClick={() => {
                              if (column.isImage && typeof value === "string" && /\.(jpg|jpeg|png|webp|gif)$/i.test(value)) {
                                handlePreviewImage(value);
                              } else if (column.isFile && typeof value === "string" && /\.pdf$/i.test(value)) {
                                handleDownloadFile(value);
                              } else {
                                handleRowSelect(!item.x, item.id as number);
                              }
                            }}
                          >
                            {/* PRIORITY BADGE */}
                            {(column.key === "priority.name_en" || column.key === "priority.name_id" || column.key === "priority.name_ph") && value ? (
                              // Supports both string and object with .name
                              typeof value === "string" ? (
                                <PriorityBadge value={value} />
                              ) : value?.name ? (
                                <PriorityBadge value={value.name} />
                              ) : (
                                "-"
                              )
                            ) : column.key === "status" ||
                              (column.key.startsWith("feature") && column.key !== "feature.name") ||
                              column.key.startsWith("privilege") ? (
                              <div onClick={(e) => e.stopPropagation()}>
                                <Switch
                                  checked={Boolean(item[column.key])}
                                  disabled={
                                    column.key.startsWith("privilege") &&
                                    !(item.feature as unknown as Record<string, boolean>)?.[column.key.replace("privilege", "feature")]
                                  }
                                  onCheckedChange={(checked) => {
                                    handleUpdateField(api, item.id as number, checked, column.key);
                                  }}
                                />
                              </div>
                            ) : column.isImage ? (
                              typeof value === "string" && /\.(jpg|jpeg|png|webp|gif)$/i.test(value) ? (
                                <Image
                                  src={`${API_URL}/${value}`}
                                  alt="Uploaded"
                                  width={32}
                                  height={32}
                                  className="rounded object-contain border border-gray-300"
                                />
                              ) : (
                                <div className="w-[32px] h-[32px] flex items-center justify-center border border-gray-300 rounded">
                                  <ImageIcon className="w-6 h-6 stroke-gray-400" />
                                </div>
                              )
                            ) : column.isFile ? (
                              <div className="w-[32px] h-[32px] flex items-center justify-center">
                                {typeof value === "string" && value ? (
                                  <FileDown className="w-6 h-6 stroke-blue-500" />
                                ) : (
                                  <FileDown className="w-6 h-6 stroke-gray-400" />
                                )}
                              </div>
                            ) : typeof value === "string" ? (
                              value.length > 30 ? (
                                value.substring(0, 30) + "..."
                              ) : (
                                formatNumericValue(value)
                              )
                            ) : (
                              formatNumericValue(value)
                            )}
                          </TableCell>
                        );
                      })}
                      {showActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={selectCount > 1}>
                              <Button className="h-8">
                                <Settings />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(api === "events" || api === "schedules") && (
                                <DropdownMenuItem asChild>
                                  <Button variant="secondary" className="border-b w-full cursor-pointer" onClick={() => handlePreviewEvent(item)}>
                                    {t("view")} {t("dashboard")}
                                  </Button>
                                </DropdownMenuItem>
                              )}
                              {canRead && (
                                <DropdownMenuItem asChild>
                                  <Button
                                    variant="gray"
                                    className="border-b w-full cursor-pointer"
                                    onClick={() => {
                                      setFormTitle("view");
                                      setSelectedDataId(item.id as number);
                                    }}
                                  >
                                    {t("view")}
                                  </Button>
                                </DropdownMenuItem>
                              )}
                              {canUpdate && (
                                <DropdownMenuItem asChild>
                                  <Button
                                    className="border-b w-full cursor-pointer"
                                    onClick={() => {
                                      setFormTitle("update");
                                      setSelectedDataId(item.id as number);
                                    }}
                                  >
                                    {t("update")}
                                  </Button>
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem asChild>
                                  <Button
                                    variant="destructive"
                                    className="border-b w-full cursor-pointer"
                                    onClick={() => {
                                      setFormTitle("delete");
                                      setSelectedDataId(item.id as number);
                                    }}
                                  >
                                    {t("delete")}
                                  </Button>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                      {subModules && subModules.length && Object.values(showActionsSub).some(Boolean) && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={selectCount > 1}>
                              <Button className="h-8">
                                <Database />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {subModules
                                .filter((sub) => showActionsSub[sub.key])
                                .map((subModule) => (
                                  <DropdownMenuItem asChild key={subModule.key}>
                                    <Button
                                      variant="gray"
                                      className="border-b w-full cursor-pointer"
                                      onClick={() => router.push(`/${subModule.parent}/${item.id}/${subModule.link}`)}
                                    >
                                      {subModule.label}
                                    </Button>
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                      <AlertResponse errorStatus={errorStatus} errorMessage={errorMessage} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ContextMenuTrigger>
          <ContextMenuContent className="space-y-1">
            {canRead && (
              <ContextMenuItem asChild>
                <Button
                  variant={"gray"}
                  className={`border-b w-full ${selectCount !== 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={selectCount !== 1}
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      setFormTitle("view");
                    }, 300);
                  }}
                >
                  {t("view")}
                </Button>
              </ContextMenuItem>
            )}
            {canUpdate && (
              <ContextMenuItem asChild>
                <Button
                  className={`border-b w-full ${selectCount !== 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={selectCount !== 1}
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      setFormTitle("update");
                    }, 300);
                  }}
                >
                  {t("update")}
                </Button>
              </ContextMenuItem>
            )}
            {canDelete && (
              <ContextMenuItem asChild>
                <Button
                  className={`border-b w-full ${selectCount < 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={selectCount < 1}
                  variant={"destructive"}
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      setFormTitle("bulkdelete");
                    }, 300);
                  }}
                >
                  {t("delete")}
                </Button>
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>
      <DataTableFooter
        canUpdate={canUpdate}
        canDelete={canDelete}
        totalData={totalData}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalPages={totalPages}
        reload={reload}
        selectCount={selectCount}
        setIsLoading={setIsLoading}
        setFormTitle={setFormTitle}
        sheetForm={sheetForm}
        t={t}
      />
    </>
  );
}
