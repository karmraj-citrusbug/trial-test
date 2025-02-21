"use client";

import { useEffect, useState } from "react";
import ProjectTable from "./components/ProjectTable";
import { IProject } from "@/types";

export default function HomePage() {
  const [projectData, setProjectData] = useState<IProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/get-folder-file-data?page=${page}&limit=${10}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setProjectData(data.data);
      setTotalItems(data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Google Drive Data</h1>
      <ProjectTable
        data={projectData}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
}
