"use client";

import { useCallback, useEffect, useState } from "react";
import { getList } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/table/data.table.skeleton";
import { useTranslations } from "next-intl";

type UserType = {
  id: number;
  photo?: string;
  name: string;
  email: string;
  phone?: string;
};

export default function UserPicker({ onSelect, onClose }: { onSelect: (user: UserType) => void; onClose: () => void }) {
  const t = useTranslations();
  const [data, setData] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(""); // actual filter for request
  const [searchInput, setSearchInput] = useState(""); // what user is typing
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getList("users", page, limit, search, "updatedAt", "desc");
      if (res?.data?.data) {
        setData(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setData([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enter to search
  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    }
  };

  // Clear filter handler
  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 relative border border-blue-200">
      <div className="flex justify-between mb-2">
        <div className="text-lg font-semibold">{t("choose_user")}</div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder={t("search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          className="border-blue-300 max-w-xs"
        />
        <Button
          size="sm"
          onClick={() => {
            setSearch(searchInput);
            setPage(1);
          }}
        >
          {t("search")}
        </Button>
        <Button size="sm" variant="secondary" onClick={handleClear} disabled={search === "" && searchInput === ""}>
          {t("clear")}
        </Button>
      </div>
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-2"></th>
              <th className="p-2">{t("name")}</th>
              <th className="p-2">{t("email")}</th>
              <th className="p-2">{t("phone")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <TableSkeleton />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {t("no_data")}
                </td>
              </tr>
            ) : (
              data.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-blue-100 cursor-pointer ${selectedId === u.id ? "bg-blue-100 font-semibold" : ""}`}
                  onClick={() => setSelectedId(u.id)}
                >
                  <td className="p-2">
                    <input type="radio" checked={selectedId === u.id} onChange={() => setSelectedId(u.id)} />
                  </td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-500">
          {t("page")}: {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            {t("prev")}
          </Button>
          <Button size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            {t("next")}
          </Button>
        </div>
        <div>
          <Button
            size="sm"
            disabled={!selectedId}
            onClick={() => {
              const user = data.find((u) => u.id === selectedId);
              if (user) onSelect(user);
            }}
          >
            {t("choose")}
          </Button>
        </div>
      </div>
    </div>
  );
}
