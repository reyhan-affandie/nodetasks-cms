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
import { ModuleForm } from "@/components/forms/features.form";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ModuleView } from "@/components/views/features.view";

const api = "features";

export default function FeaturesPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTableData, setRefreshTableData] = useState(false);
  const [data, setData] = useState<ApiPayload[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updatedAt");
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

  const columns: TableKeyType[] = [
    { key: "no", label: "No", sort: false, isImage: false, isFile: false },
    { key: "name", label: t("name"), sort: true, isImage: false, isFile: false },
    { key: "description", label: t("description"), sort: true, isImage: false, isFile: false },
    { key: "createdAt", label: t("createdAt"), sort: true, isImage: false, isFile: false },
    { key: "updatedAt", label: t("updatedAt"), sort: true, isImage: false, isFile: false },
    { key: "featureCreate", label: t("create"), sort: false, isImage: false, isFile: false },
    { key: "featureRead", label: t("read"), sort: false, isImage: false, isFile: false },
    { key: "featureUpdate", label: t("update"), sort: false, isImage: false, isFile: false },
    { key: "featureDelete", label: t("delete"), sort: false, isImage: false, isFile: false },
  ];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getList(api, page, limit, search, sort, order);
      if (res?.data?.totalData > 0) {
        const resDataTable = res?.data?.data.map((item: ApiPayload, index: number) => ({
          x: false,
          no: (page - 1) * 10 + (index + 1),
          ...item,
          createdAt: item.createdAt ? format(new Date(item.createdAt as Date), "MMM dd, yyyy HH:mm:ss") : "-",
          updatedAt: item.updatedAt ? format(new Date(item.updatedAt as Date), "MMM dd, yyyy HH:mm:ss") : "-",
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
  }, [page, limit, search, sort, order]);

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
        />
      )}
    </DefaultLayout>
  );
}
