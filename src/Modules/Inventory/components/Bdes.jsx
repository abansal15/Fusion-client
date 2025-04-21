import React, { useState, useEffect } from "react";
import { Table, Container, Group, Button, Text, ScrollArea, Select } from "@mantine/core";
import { useSelector } from "react-redux";
import AddProduct from "./AddProduct";
import TransferProduct from "./TransferProduct";
import RequestProduct from "./RequestProduct";
import "../styles/popupModal.css";
import { InventoryDepartments } from "../../../routes/inventoryRoutes";

export default function Inventory() {
  const role = useSelector((state) => state.user.role);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showTransferProductModal, setShowTransferProductModal] = useState(false);
  const [showRequestProductModal, setShowRequestProductModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const [departments, setDepartment] = useState([]);
  const departments2 = [
    { label: "CSE", value: "CSE" },
    { label: "ECE", value: "ECE" },
    { label: "ME", value: "ME" },
    { label: "SM", value: "SM" },
    { label: "NS", value: "NS" },
    { label: "Design", value: "Design" },
  ];

  const getDepartmentLabel = () => {
    if (role === "deptadmin_cse") return "CSE";
    if (role === "deptadmin_ece" || role === "Junior Technician") return "ECE";
    if (role === "deptadmin_me") return "Mech";
    if (role === "deptadmin_sm") return "SM";
    if (role === "deptadmin_design") return "Design";
    return "";
  };

  const isDefaultRole = ![
    "deptadmin_cse",
    "deptadmin_ece",
    "Junior Technician",
    "deptadmin_me",
    "deptadmin_sm",
    "deptadmin_design",
  ].includes(role);

  useEffect(() => {
    if (!selectedDepartment && !isDefaultRole) {
      setSelectedDepartment(getDepartmentLabel());
    }
    if (isDefaultRole) {
      setDepartment(departments2);
    } else {
      setDepartment([{ label: getDepartmentLabel(), value: getDepartmentLabel() }]);
    }
  }, [role, selectedDepartment, isDefaultRole]);

  const fetchDepartmentData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to view inventory");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(InventoryDepartments(selectedDepartment), {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch department data");
      const data = await res.json();
      setInventoryData(data);
    } catch (err) {
      console.error(err);
      alert("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDepartment) fetchDepartmentData();
  }, [selectedDepartment]);

  // centralized cell style
  const tdStyle = {
    padding: "15px",
    border: "1px solid #ddd",
    textAlign: "center",
  };

  // modal controls
  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);
  const openTransferModal = () => setShowTransferProductModal(true);
  const closeTransferModal = () => setShowTransferProductModal(false);
  const openRequestModal = () => setShowRequestProductModal(true);
  const closeRequestModal = () => setShowRequestProductModal(false);

  return (
    <>
      <Text style={{ marginLeft: 70, fontSize: 16 }} color="dimmed">
        <span
          style={{ cursor: "pointer" }}
          role="button"
          onClick={() => setSelectedDepartment("")}
        >
          Departments
        </span>{" > "}
        <span>{selectedDepartment}</span>
      </Text>

      <Container style={{ maxWidth: 1000, padding: 20 }}>
        <Text
          align="center"
          style={{ fontSize: 26, marginBottom: 20, fontWeight: 600, color: "#228BE6" }}
        >
          {selectedDepartment || "All"} Department Inventory
        </Text>

        <Select
          placeholder="Select Department"
          data={departments}
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          style={{ width: "90%", margin: "0 auto 20px auto" }}
        />

        {isDefaultRole ? (
          <Group position="center" style={{ marginBottom: 20, gap: 10 }}>
            <Button onClick={openTransferModal}>Transfer Item</Button>
            <Button onClick={openAddProductModal}>Add Product</Button>
          </Group>
        ) : (
          <Group position="center" style={{ marginBottom: 20, gap: 10 }}>
            <Button onClick={openAddProductModal}>Add Product</Button>
            <Button onClick={openRequestModal}>Request Product</Button>
          </Group>
        )}

        <ScrollArea style={{ width: "100%", margin: "0 auto" }}>
          <Table>
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
                  <tr
                    key={idx}
                    style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}
                  >
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
        {showAddProductModal && (
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
                  val="departments"
                  name="department_name"
                />
              </div>
            </div>
          </>
        )}

        {/* Transfer Product Modal Overlay */}
        {showTransferProductModal && (
          <>
            <div className="modal-backdrop" onClick={closeTransferModal} />
            <div className="modal-content">
              <button className="modal-close" onClick={closeTransferModal}>X</button>
              <TransferProduct closeModal={closeTransferModal} />
            </div>
          </>
        )}

        {/* Request Product Modal Overlay */}
        {showRequestProductModal && (
          <>
            <div className="modal-backdrop" onClick={closeRequestModal} />
            <div className="modal-content">
              <button className="modal-close" onClick={closeRequestModal}>X</button>
              <RequestProduct closeModal={closeRequestModal} selectedDepartment={selectedDepartment} />
            </div>
          </>
        )}
      </Container>
    </>
  );
}
