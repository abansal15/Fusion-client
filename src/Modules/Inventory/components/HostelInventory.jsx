import React, { useState, useEffect } from "react";
import { Table, Group, Button, Text, Select, ScrollArea } from "@mantine/core";
import { useSelector } from "react-redux";
import AddProduct from "./AddProduct";
import TransferProduct from "./TransferProduct";
import RequestProduct from "./RequestProduct";
import { InventorySections } from "../../../routes/inventoryRoutes";

export default function HostelInventory() {
  const role = useSelector((state) => state.user.role);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showTransferProductModal, setShowTransferProductModal] = useState(false);
  const [showRequestProductModal, setShowRequestProductModal] = useState(false);

  let departments = [
    { label: "H1", value: "H1" },
    { label: "H3", value: "H3" },
    { label: "H4", value: "H4" },
    { label: "Panini", value: "Panini" },
    { label: "Nagarjuna", value: "Nagarjuna" },
    { label: "Maa Saraswati", value: "Maa Saraswati" },
    { label: "RSPC", value: "RSPC" },
    { label: "GymKhana", value: "GymKhana" },
    { label: "IWD", value: "IWD" },
    { label: "Mess", value: "Mess" },
    { label: "Academic", value: "Academic" },
    { label: "VH", value: "VH" },
  ];

  const renderDepartmentLabel = () => {
    if (role === "ps_admin") return selectedDepartment || "H1";
    switch (role) {
      case "hall1caretaker":
        departments = [{ label: "H1", value: "H1" }]; return "H1";
      case "hall3caretaker":
        departments = [{ label: "H3", value: "H3" }]; return "H3";
      case "hall4caretaker":
        departments = [{ label: "H4", value: "H4" }]; return "H4";
      case "phcaretaker":
        departments = [{ label: "Panini", value: "Panini" }]; return "Panini";
      case "nhcaretaker":
        departments = [{ label: "Nagarjuna", value: "Nagarjuna" }]; return "Nagarjuna";
      case "mshcaretaker":
        departments = [{ label: "Maa Saraswati", value: "Maa Saraswati" }]; return "Maa Saraswati";
      case "rspc_admin":
        departments = [{ label: "RSPC", value: "RSPC" }]; return "RSPC";
      case "SectionHead_IWD":
        departments = [{ label: "IWD", value: "IWD" }]; return "IWD";
      case "mess_manager":
        departments = [{ label: "Mess", value: "Mess" }]; return "Mess";
      case "acadadmin":
        departments = [{ label: "Academic", value: "Academic" }]; return "Academic";
      case "VhCaretaker":
        departments = [{ label: "VH", value: "VH" }]; return "VH";
      default:
        return "H1";
    }
  };

  useEffect(() => {
    if (!selectedDepartment) {
      if (role === "ps_admin") {
        setSelectedDepartment("H1");
      } else {
        setSelectedDepartment(renderDepartmentLabel());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchDepartmentData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to view inventory");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(InventorySections(selectedDepartment), {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch section data");
      const data = await res.json();
      setInventoryData(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDepartment) fetchDepartmentData();
  }, [selectedDepartment]);

  const tdStyle = {
    padding: "15px",
    border: "1px solid #ddd",
    textAlign: "center",
  };

  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);
  const openTransferModal = () => setShowTransferProductModal(true);
  const closeTransferModal = () => setShowTransferProductModal(false);
  const openRequestModal = () => setShowRequestProductModal(true);
  const closeRequestModal = () => setShowRequestProductModal(false);

  return (
    <>
      {/* Breadcrumb */}
      <Text style={{ marginLeft: 70, fontSize: 16 }} color="dimmed">
        <span
          style={{ cursor: "pointer" }}
          role="button"
          onClick={() => setSelectedDepartment("")}
        >
          Sections
        </span>{" "}&gt; <span>{renderDepartmentLabel()}</span>
      </Text>

      {/* Title */}
      <Text
        align="center"
        style={{ fontSize: 26, marginBottom: 20, fontWeight: 600, color: "#228BE6" }}
      >
        {renderDepartmentLabel()} Inventory
      </Text>

      {/* Section selector */}
      <Select
        placeholder="Select Section"
        data={departments.map((d) => ({ value: d.value, label: d.label }))}
        value={selectedDepartment}
        onChange={setSelectedDepartment}
        style={{ width: "70%", margin: "0 auto 20px" }}
      />

      {/* Action buttons */}
      {role === "ps_admin" ? (
        <Group position="center" style={{ marginBottom: 20, gap: 10 }}>
          <Button onClick={openTransferModal}>Transfer Item</Button>
          <Button onClick={openAddProductModal}>Add Product</Button>
        </Group>
      ) : (
        <Group position="center" style={{ marginBottom: 20 }}>
          <Button onClick={openAddProductModal}>Add Product</Button>
          <Button onClick={openRequestModal}>Request Product</Button>
        </Group>
      )}

      {/* Inventory table */}
      <ScrollArea style={{ width: "80%", margin: "0 auto" }}>
        <Table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={tdStyle}>Item</th>
              <th style={tdStyle}>Quantity</th>
              <th style={tdStyle}>Indent ID</th>
              <th style={tdStyle}>Specifications</th>
              <th style={tdStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, fontSize: 16, color: "#666" }}>
                  Loading data...
                </td>
              </tr>
            ) : (
              inventoryData.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                  <td style={tdStyle}>{item.item_name}</td>
                  <td style={tdStyle}>{item.quantity}</td>
                  <td style={tdStyle}>{item.indent_id ?? "—"}</td>
                  <td style={tdStyle}>
                    {item.specifications?.length > 50
                      ? item.specifications.slice(0, 50) + "…"
                      : item.specifications || "—"}
                  </td>
                  <td style={tdStyle}>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </ScrollArea>

      {/* Add Product Modal Overlay */}
      {role === "ps_admin" && showAddProductModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
            onClick={closeAddProductModal}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: "600px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              zIndex: 1001,
              overflow: "hidden",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
              onClick={closeAddProductModal}
            >
              X
            </button>
            <div style={{ margin: "20px" }}>
              <AddProduct
                onSuccess={closeAddProductModal}
                selectedDepartment={selectedDepartment}
                val="sections"
                name="section_name"
              />
            </div>
          </div>
        </>
      )}

      {/* Transfer and Request Modals unchanged... */}
    </>
  );
}