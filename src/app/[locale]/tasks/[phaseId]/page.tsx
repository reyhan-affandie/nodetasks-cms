"use client";

import { getList, getOne } from "@/actions/actions";
import DefaultLayout from "@/components/layout/app.layout";
import { useCallback, useEffect, useState } from "react";
import { TableSkeleton } from "@/components/table/data.table.skeleton";
import { toastMessage } from "@/components/customs/toast.message";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { DataTableDelete } from "@/components/table/data.table.delete";
import { DataTableUI } from "@/components/table/data.table";
import { ApiPayload, TableKeyType } from "@/types/apiResult.type";
import { ModuleForm } from "@/components/forms/tasks.form";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { ModuleView } from "@/components/views/tasks.view";
import { useParams } from "next/navigation";

const api = "tasks";

export default function TasksPhasePage() {
  const params = useParams();
  const phaseId = params?.phaseId;
  const t = useTranslations();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTableData, setRefreshTableData] = useState(false);
  const [data, setData] = useState<ApiPayload[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(`priority.name_${locale}`);
  const [order, setOrder] = useState("desc");
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [errorStatus, setErrorStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [trap, setTrap] = useState(0);
  const [alertViewOpen, setAlertViewOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [alertDeleteOpen, setAlertDeleteOpen] = useState(false);

  const [selectedDataId, setSelectedDataId] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<DefaultStateType>({
    ...FORM_INITIAL_STATE,
  });
  const [selectCount, setSelectCount] = useState<number>(0);
  const [selectedDataIds, setSelectedDataIds] = useState<Array<number>>([]);
  const [selectedDataDescriptions, setSelectedDataDescriptions] = useState<Array<string>>([]);

  const [phaseLabel, setPhaseLabel] = useState<string>("");

  const columns: TableKeyType[] = [
    { key: "no", label: "No", sort: false, isImage: false, isFile: false },
    { key: "image", label: t("image"), sort: false, isImage: true, isFile: false },
    { key: "file", label: t("file"), sort: false, isImage: false, isFile: true },
    { key: "name", label: t("name"), sort: true, isImage: false, isFile: false },
    { key: "author.name", label: t("author"), sort: true, isImage: false, isFile: false },
    { key: "assignee.name", label: t("assignee"), sort: true, isImage: false, isFile: false },
    { key: "description", label: t("description"), sort: false, isImage: false, isFile: false },
    { key: "start", label: t("start"), sort: true, isImage: false, isFile: false },
    { key: "deadline", label: t("deadline"), sort: true, isImage: false, isFile: false },
    { key: `priority.name_${locale}`, label: t("priority"), sort: true, isImage: false, isFile: false },
  ];

  useEffect(() => {
    async function fetchPhaseLabel() {
      if (!phaseId) return setPhaseLabel("");
      const phaseRes = await getOne("phases", Number(phaseId));
      const phase = phaseRes?.data;
      if (!phase) return setPhaseLabel("");
      let label = phase.name;
      if (locale === "id" && phase.name_id) label = phase.name_id;
      else if (locale === "ph" && phase.name_ph) label = phase.name_ph;
      else if (locale === "en" && phase.name_en) label = phase.name_en;
      setPhaseLabel(label);
    }
    fetchPhaseLabel();
  }, [phaseId, locale]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getList(api, page, limit, search, sort, order, { phase: Number(phaseId) });
      if (res?.data?.totalData > 0) {
        const resDataTable = res?.data?.data.map((item: ApiPayload, index: number) => ({
          x: false,
          no: (page - 1) * 10 + (index + 1),
          ...item,
          start: item.start ? format(new Date(item.start as Date), "MMM dd, yyyy") : "-",
          deadline: item.deadline ? format(new Date(item.deadline as Date), "MMM dd, yyyy") : "-",
        }));
        setData(resDataTable);
        setPage(res?.data?.page);
        setTotalData(res?.data?.totalData);
        setTotalPages(res?.data?.totalPages);
        setErrorStatus(0);
        setErrorMessage("");
        setRefreshTableData(false);
      } else {
        setData([]);
        setPage(1);
        setTotalData(0);
        setTotalPages(1);
        setErrorStatus(res?.status);
        setErrorMessage(res?.statusText);
        setRefreshTableData(false);
      }
    } catch (error) {
      console.error(error);
      toastMessage({
        api: api,
        variant: "destructive",
        status: 500,
        statusText: "Unknown error, please contact our customer support. thank you",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sort, order, phaseId]);

  const reload = async () => {
    const currentSearch = Date.now();
    if (currentSearch < trap + 500) {
      return true;
    }
    setTrap(currentSearch);
    setRefreshTableData(true);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOneData = async () => {
    await getOne(api, selectedDataId).then((res) => {
      if (res.error === false) {
        const defaultState = {
          data: {
            formMethod: formTitle,
            api: api,
            ...res.data,
          },
          zodErrors: null,
          error: null,
          message: null,
        };
        setSelectedData(defaultState);
      }
    });
  };

  useEffect(() => {
    if (isLoading === true && data?.length > 0) {
      setIsLoading(false);
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (refreshTableData === true) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTableData, search, sort, order, page, limit]);

  useEffect(() => {
    if (selectedDataId !== 0) {
      getOneData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataId, formTitle]);

  useEffect(() => {
    if (selectedData?.data?.formMethod === "view") {
      setAlertViewOpen(true);
    }
    if (selectedData?.data?.formMethod === "update") {
      setSheetOpen(true);
    }
    if (selectedData?.data?.formMethod === "delete") {
      setAlertDeleteOpen(true);
    }
  }, [selectedData]);

  useEffect(() => {
    if (formTitle === "bulkdelete" && selectCount > 0 && selectedDataIds?.length > 0) {
      setAlertDeleteOpen(true);
    }
  }, [formTitle, selectCount, selectedDataIds]);

  const sheetView = (
    <ModuleView
      api={api}
      setFormTitle={setFormTitle}
      alertViewOpen={alertViewOpen}
      setAlertViewOpen={setAlertViewOpen}
      setData={setData}
      selectedData={selectedData}
      setSelectedDataId={setSelectedDataId}
      setSelectedDataIds={setSelectedDataIds}
      setSelectCount={setSelectCount}
      setSelectedData={setSelectedData}
    />
  );

  const sheetForm = (
    <ModuleForm
      api={api}
      formTitle={formTitle}
      setFormTitle={setFormTitle}
      setSheetOpen={setSheetOpen}
      setData={setData}
      selectedData={selectedData}
      setSelectedDataId={setSelectedDataId}
      setSelectedDataIds={setSelectedDataIds}
      setSelectCount={setSelectCount}
      setSelectedData={setSelectedData}
      reload={reload}
    />
  );

  const alertDelete = (
    <DataTableDelete
      api={api}
      setFormTitle={setFormTitle}
      setRefreshTableData={setRefreshTableData}
      description={selectedData?.data?.name}
      alertDeleteOpen={alertDeleteOpen}
      setAlertDeleteOpen={setAlertDeleteOpen}
      selectedDataId={selectedDataId}
      setSelectedDataId={setSelectedDataId}
      selectedDataIds={selectedDataIds}
      setSelectedDataIds={setSelectedDataIds}
      selectedDataDescriptions={selectedDataDescriptions}
      setSelectedDataDescriptions={setSelectedDataDescriptions}
      setSelectedData={setSelectedData}
      setSelectCount={setSelectCount}
    />
  );

  const tableTitle = phaseLabel ? `${t("tasks")} | ${phaseLabel}` : t("tasks");

  return (
    <DefaultLayout>
      {sheetView}
      {alertDelete}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTableUI
          api={api}
          columns={columns}
          sheetForm={sheetForm}
          setFormTitle={setFormTitle}
          setSelectedDataId={setSelectedDataId}
          errorStatus={errorStatus}
          errorMessage={errorMessage}
          setIsLoading={setIsLoading}
          reload={reload}
          data={data}
          setData={setData}
          page={page}
          setPage={setPage}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
          totalData={totalData}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
          search={search}
          setSearch={setSearch}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
          selectCount={selectCount}
          setSelectCount={setSelectCount}
          selectedDataIds={selectedDataIds}
          setSelectedDataIds={setSelectedDataIds}
          selectedDataDescriptions={selectedDataDescriptions}
          setSelectedDataDescriptions={setSelectedDataDescriptions}
          tableTitle={tableTitle}
        />
      )}
    </DefaultLayout>
  );
}
