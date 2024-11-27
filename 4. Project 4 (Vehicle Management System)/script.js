document.addEventListener("DOMContentLoaded", function () {
    const vehicleList = document.getElementById("vehicleList");
    const parkingDiagram = document.getElementById("parkingDiagram");
    const receiptDiv = document.getElementById("receipt");
    const receiptDetails = document.getElementById("receiptDetails");
    const closeReceipt = document.getElementById("closeReceipt");
    const printReceiptButton = document.getElementById("printReceipt");
    const reportTableBody = document.getElementById("reportTableBody");

    const savedVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    const savedReport = JSON.parse(localStorage.getItem("report")) || [];
    const parkingSlots = 10;
    const parkingSlotsState = Array(parkingSlots).fill(null);
    const chargePerVehicle = 20;

    // Load saved data
    savedVehicles.forEach((vehicle, index) => {
        parkingSlotsState[index] = vehicle;
    });
    savedReport.forEach(entry => displayReport(entry));

    renderParkingDiagram();

    // Handle form submission
    document.getElementById("vehicleForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const vehicleName = document.getElementById("vehicleName").value;
        const vehicleModel = document.getElementById("vehicleModel").value;
        const vehicleRegNo = document.getElementById("vehicleRegNo").value;
        const vehicleOwner = document.getElementById("vehicleOwner").value;
        const vehicleColor = document.getElementById("vehicleColor").value;

        const freeSlotIndex = parkingSlotsState.indexOf(null);
        if (freeSlotIndex === -1) {
            alert("No parking slots available!");
            return;
        }

        const newVehicle = {
            name: vehicleName,
            model: vehicleModel,
            regNo: vehicleRegNo,
            owner: vehicleOwner,
            color: vehicleColor,
            parkedAt: new Date().toLocaleString(),
            slot: freeSlotIndex
        };

        parkingSlotsState[freeSlotIndex] = newVehicle;
        savedVehicles.push(newVehicle);
        localStorage.setItem("vehicles", JSON.stringify(parkingSlotsState));

        renderParkingDiagram();
        document.getElementById("vehicleForm").reset();
    });

    // Render parking diagram
    function renderParkingDiagram() {
        parkingDiagram.innerHTML = "";
        parkingSlotsState.forEach((slot, index) => {
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("slot");
            slotDiv.classList.toggle("occupied", slot !== null);
            slotDiv.innerText = slot ? `Slot ${index + 1}` : "Free";

            slotDiv.addEventListener("click", () => {
                if (slot) {
                    const exitTime = new Date().toLocaleString();
                    const duration = calculateCharge(slot.parkedAt, exitTime);
                    const totalCharge = duration * chargePerVehicle;

                    // Generate receipt
                    receiptDetails.innerHTML = `
                        <p><strong>Vehicle Name:</strong> ${slot.name}</p>
                        <p><strong>Model:</strong> ${slot.model}</p>
                        <p><strong>Registration No:</strong> ${slot.regNo}</p>
                        <p><strong>Owner:</strong> ${slot.owner}</p>
                        <p><strong>Parked At:</strong> ${slot.parkedAt}</p>
                        <p><strong>Exited At:</strong> ${exitTime}</p>
                        <p><strong>Total Charge:</strong> ${totalCharge} Taka</p>
                    `;

                    // Update report
                    const reportEntry = {
                        ...slot,
                        exitedAt: exitTime,
                        charge: totalCharge
                    };
                    

                    displayReport(reportEntry);
                    savedReport.push(reportEntry);
                    localStorage.setItem("report", JSON.stringify(savedReport));

                    // Remove vehicle from parking
                    parkingSlotsState[index] = null;
                    localStorage.setItem("vehicles", JSON.stringify(parkingSlotsState));
                    renderParkingDiagram();

                    receiptDiv.classList.remove("hidden");
                }
            });

            parkingDiagram.appendChild(slotDiv);
        });
    }


    // Display report
    function displayReport(entry) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.model}</td>
            <td>${entry.regNo}</td>
            <td>${entry.owner}</td>
            <td>${entry.parkedAt}</td>
            <td>${entry.exitedAt}</td>
            <td>${entry.charge} Taka</td>
        `;
        reportTableBody.appendChild(row);
        document.getElementById("vehicleReport").classList.remove("hidden");
    }

    // Close receipt
    closeReceipt.addEventListener("click", () => {
        receiptDiv.classList.add("hidden");
    });

    // Print receipt functionality
    printReceiptButton.addEventListener("click", function () {
        const printContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="text-align: center; color: #333;">Receipt</h2>
                ${receiptDetails.innerHTML}
            </div>
        `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(`<html><head><title>Receipt</title></head><body>${printContent}</body></html>`);
        newWindow.document.close();
        newWindow.print();
        newWindow.close();
    });

    // Calculate charge
    function calculateCharge(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        return hours;
    }

    // Make Layout Responsive (No CSS changes, dynamic adjustment)
    function adjustLayout() {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 768) {
            // Adjust for small screens
            parkingDiagram.style.display = "flex";
            parkingDiagram.style.flexWrap = "wrap";
            parkingDiagram.style.justifyContent = "center";

            document.getElementById("vehicleReport").style.overflowX = "auto";
        } else {
            // Restore for larger screens
            parkingDiagram.style.display = "grid";
            parkingDiagram.style.gridTemplateColumns = "repeat(5, 1fr)";
            document.getElementById("vehicleReport").style.overflowX = "visible";
        }
    }

    // Listen to resize events
    window.addEventListener("resize", adjustLayout);

    // Initial Adjustment
    adjustLayout();
});
