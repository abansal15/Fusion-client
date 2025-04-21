import React, { useState } from "react";
import PropTypes from "prop-types";
import "../styles/addProduct.css";
import { InventoryAdd } from "../../../routes/inventoryRoutes";

function AddProduct({ onSuccess, selectedDepartment, val, name }) {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    indent_id: "",
    specifications: "",
    date: "",       // ISO yyyy-mm-dd from <input type="date">
  });

  const handleChange = (e) => {
    const { name: inputName, value } = e.target;
    setFormData({ ...formData, [inputName]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to add a product");
      return;
    }
    // ensure your new fields are non‑empty if required

    console.log("Form data:", formData);

    const { indent_id, productName, quantity, specifications, date } = formData;
    if (!indent_id || !productName || !quantity || !specifications || !date) {
      alert("Please fill in all the fields");
      return;
    }

    try {
      const response = await fetch(InventoryAdd(val), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          item_name: formData.productName,
          quantity: parseInt(formData.quantity, 10),
          indent_id: formData.indent_id,
          specifications: formData.specifications,
          date: formData.date,                // "YYYY-MM-DD"
          [name]: selectedDepartment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to add product: ${errorData.detail || response.statusText}`
        );
      }

      await response.json();
      alert("Product added successfully!");
      onSuccess?.();
    } catch (error) {
      const errorData = await response.json();
      console.error("Validation errors:", errorData);
      alert(
        "Error adding product:\n" +
          Object.entries(errorData)
            .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
            .join("\n")
      );

    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        {/* existing fields */}
        <div>
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Enter Product Name"
          />
        </div>
        <div>
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter Quantity"
          />
        </div>

        {/* new fields */}
        <div>
          <label htmlFor="indent_id">Indent ID</label>
          <input
            type="text"
            id="indent_id"
            name="indent_id"
            value={formData.indent_id}
            onChange={handleChange}
            placeholder="Enter Indent ID"
          />
        </div>
        <div>
          <label htmlFor="specifications">Specifications</label>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            placeholder="Enter Specifications"
          />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <center>
          <button type="submit">Add Product</button>
        </center>
      </form>
    </div>
  );
}

AddProduct.propTypes = {
  onSuccess: PropTypes.func,
  selectedDepartment: PropTypes.string.isRequired,
  val: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default AddProduct;
