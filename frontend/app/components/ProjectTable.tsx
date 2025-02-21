"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Modal, Table } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { AlignType } from "rc-table/lib/interface";

import { IFileItem, ILog, IProject, IProjectTableProps } from "@/types";

import app_bb_pdf from "@/assets/icons/app_bb_pdf.jpg";
import app_gd from "@/assets/icons/app_gd.jpg";
import app_gs from "@/assets/icons/app_gs.jpg";
import app_jpg_pdf from "@/assets/icons/app_jpg_pdf.jpg";
import bb_t_done from "@/assets/icons/bb_t_done.jpg";
import bb_t_working from "@/assets/icons/bb_t_working.jpg";
import gs_p_done from "@/assets/icons/gs_p_done.jpg";
import gs_p_working from "@/assets/icons/gs_p_working.jpg";
import gs_t_done from "@/assets/icons/gs_t_done.jpg";
import gs_t_working from "@/assets/icons/gs_t_working.jpg";
import unrecognized from "@/assets/icons/unrecognized.jpg";

const iconMap: Record<string, string> = {
  app_bb_pdf: app_bb_pdf.src,
  app_gd: app_gd.src,
  app_gs: app_gs.src,
  app_jpg_pdf: app_jpg_pdf.src,
  bb_t_done: bb_t_done.src,
  bb_t_working: bb_t_working.src,
  gs_p_done: gs_p_done.src,
  gs_p_working: gs_p_working.src,
  gs_t_done: gs_t_done.src,
  gs_t_working: gs_t_working.src,
  unrecognized: unrecognized.src,
};

const ProjectTable = ({
  data,
  currentPage,
  totalItems,
  onPageChange,
  loading,
}: IProjectTableProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedLogs, setSelectedLogs] = useState<ILog[]>([]);
  const [tableData, setTableData] = useState<IProject[]>(data);

  const showLogs = (logs: ILog[]) => {
    setSelectedLogs(logs);
    setIsModalVisible(true);
  };

  const getIcon = (icon_filename: string) => {
    const fileName = icon_filename.split(".")[0];
    return (iconMap[fileName] || unrecognized).toString();
  };

  const fileColumns = [
    {
      title: "Icon",
      dataIndex: "icon_filename",
      key: "icon_filename",
      render: (text: string, record: IFileItem) => (
        <Link href={record.gdrive_url || "#"}>
          <img
            src={getIcon(record.icon_filename)}
            alt={text}
            className="w-6 h-6 object-contain"
          />
        </Link>
      ),
    },
    {
      title: "File Name",
      dataIndex: "filename",
      key: "filename",
      render: (text: string, record: IFileItem) => (
        <Link
          href={record.gdrive_url || "#"}
          target="_blank"
          className="flex items-center gap-2"
        >
          <span className="text-sm">{text}</span>
        </Link>
      ),
    },

    {
      title: "Timestamp",
      dataIndex: "date_time",
      key: "date_time",
    },
  ];

  const columns = [
    {
      title: "Google Drive",
      dataIndex: "gdrive_url",
      key: "gdrive_url",
      align: "center" as AlignType,
      render: (text: string, record: IProject) => (
        <Link
          href={text || "#"}
          target="_blank"
          className="flex justify-center items-center"
        >
          <img
            src={getIcon(record.icon_filename)}
            alt={text}
            className="w-6 h-6 object-contain"
          />
        </Link>
      ),
    },
    {
      title: "Folder Name",
      dataIndex: "foldername",
      key: "foldername",
      render: (text: string, record: IProject) => (
        <Link
          href={record.gdrive_url || "#"}
          target="_blank"
          className="flex items-center gap-2"
        >
          <span className="text-sm">{text}</span>
        </Link>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "date_time",
      key: "date_time",
    },
    {
      title: "Logs",
      dataIndex: "logs",
      key: "logs",
      align: "center" as AlignType,
      render: (logs: ILog[]) => (
        <Button type="link" onClick={() => showLogs(logs)}>
          View Logs
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center" as AlignType,
      render: (_: any, record: IProject) => (
        <Button type="link" danger onClick={() => handleRemove(record.id)}>
          Remove
        </Button>
      ),
    },
  ];

  const logsColumns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "Description",
      dataIndex: "status",
      key: "status",
    },
  ];

  const handleRemove = (id: string) => {
    setTableData((prevData) => prevData.filter((item) => item.id !== id));
  };

  useEffect(() => {
    setTableData(data);
  }, [data]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{
          current: currentPage,
          total: Number(totalItems),
          showSizeChanger: false,
          onChange: (page) => {
            onPageChange(page);
          },
        }}
        expandable={{
          expandedRowRender: (record: IProject) => (
            <div className="pl-16">
              {" "}
              <Table
                columns={fileColumns}
                dataSource={record.files}
                rowKey={(record) => `${record.file_id}-${record.gdrive_url}`}
                pagination={false}
                size="small"
                key={record.id}
              />
            </div>
          ),
          expandIcon: ({ expanded, onExpand, record }) => (
            <Button
              type="text"
              onClick={(e) => onExpand(record, e)}
              icon={<DownOutlined rotate={expanded ? 180 : 0} />}
            />
          ),
        }}
      />
      <Modal
        title="Processing Logs"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Table
          columns={logsColumns}
          dataSource={selectedLogs.map((log, index) => ({
            key: index,
            timestamp: log.timestamp,
            status: log.status,
          }))}
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default ProjectTable;
