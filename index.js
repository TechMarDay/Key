const getKey = async (url, token) => {
    // Define the URL
    const urlkey = 'https://beautiful-fudge-8b4728.netlify.app/';
    const getKey = await fetch(urlkey, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!getKey.ok) {
        throw new Error('Network response was not ok');
    }

    return await getKey.text();
}

function showMessage(message, type, tool) {
    const messageDiv = document.getElementById(`${tool}Message`);
    messageDiv.innerHTML = message;
    messageDiv.className = type;
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

let selectedFile;

document.getElementById('fileInput').addEventListener('change', function (event) {
    selectedFile = event.target.files[0];
});

async function renameFiles() {
    try {
        if (!selectedFile) {
            showMessage('Please select a ZIP file.', 'error');
            return;
        }
        $('#loadingModal').modal('show');
        const zipFile = await JSZip.loadAsync(selectedFile);

        for (const zipEntryName in zipFile.files) {
            if (zipEntryName.endsWith('.zip')) {
                const subZipFile = await zipFile.files[zipEntryName].async('blob');
                const subZip = await JSZip.loadAsync(subZipFile);

                const newNamePrefix = zipEntryName.split('.zip')[0];

                for (const subZipEntryName in subZip.files) {
                    if (subZipEntryName.endsWith('invoice.html')) {
                        const content = await subZip.files[subZipEntryName].async('string');
                        subZip.file(`${newNamePrefix}.html`, content);
                        delete subZip.files[subZipEntryName];
                    }

                    if (subZipEntryName.endsWith('details.js')) {
                        const content = await subZip.files[subZipEntryName].async('string');
                        subZip.file(`${newNamePrefix}.js`, content);
                        delete subZip.files[subZipEntryName];
                    }

                    if (subZipEntryName.endsWith('invoice.xml')) {
                        const content = await subZip.files[subZipEntryName].async('string');
                        subZip.file(`${newNamePrefix}.xml`, content);
                        delete subZip.files[subZipEntryName];
                    }

                    if (subZipEntryName.endsWith('sign-check.jpg')) {
                        const content = await subZip.files[subZipEntryName].async('string');
                        subZip.file(`${newNamePrefix}.html`, content);
                        delete subZip.files[subZipEntryName];
                    }

                    if (subZipEntryName.endsWith('viewinvoice-bg.jpg')) {
                        const content = await subZip.files[subZipEntryName].async('string');
                        subZip.file(`${newNamePrefix}.jpg`, content);
                        delete subZip.files[subZipEntryName];
                    }

                }

                await zipFile.file(zipEntryName, await subZip.generateAsync({ type: 'blob' }));
            }
        }

        await zipFile.generateAsync({ type: 'blob' }).then(blob => {
            saveAs(blob, 'invoice_files_renamed.zip');
        });
        $('#loadingModal').modal('hide');
        showMessage('Đổi tên file thành công', 'success');
    } catch (error) {
        console.error('Error:', error);
        $('#loadingModal').modal('hide');
        handleError("Xảy ra lỗi khi đổi tên file, vui lòng thử lại")
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.className = type;
}
function formatDate(dateString, isStart) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const time = isStart ? '00:00:00' : '23:59:59';
    return `${day}/${month}/${year}T${time}`;
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ''); // remove white spaces
}

function formatDateInvoice(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getUTCFullYear();

    return `${day}_${month}_${year}`;
}

let baseUrl = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/export-xml';
const fetchAllPurchasedInvoicesData = async () => {
    try {

        let token = localStorage.getItem('token');
        // Get the values of the startDate and endDate input fields
        const startDateValue = document.getElementById('startDate').value;
        const endDateValue = document.getElementById('endDate').value;

        // Format the dates to match the desired format (MM/DD/YYYY)
        const formattedStartDate = formatDate(startDateValue, true);
        const formattedEndDate = formatDate(endDateValue);

        const ketQuaKiemTra = document.getElementById('kqkt').value;
        const getUrl = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=15&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate};ttxly==${ketQuaKiemTra}`;

        let size = 1;
        let state = '';
        var response1 = await fetch(getUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            })
            .then(data => {
                size = data.total; // Assuming 'total' is a property in the JSON response
                console.log(size);
            })
            .catch(error => {
                handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
            });

        const getUrl2 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate};ttxly==${ketQuaKiemTra}`;

        const response = await fetch(getUrl2, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        state = responseData.state;

        let getUrl3 = null;
        let getUrl4 = null;
        let state3 = '';
        let responseData3 = [];
        let responseData4 = [];

        if (state != null && state != '') {
            getUrl3 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&state=${state}&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate};ttxly==${ketQuaKiemTra}`;
        }

        if (getUrl3) {
            const response3 = await fetch(getUrl3, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response3.ok) {
                throw new Error('Network response was not ok');
            }

            responseData3 = await response3.json();
            state3 = responseData3.state;


            if (state3 != null && state3 != '') {
                getUrl4 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&state=${state3}&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate};ttxly==${ketQuaKiemTra}`;
            }

            if (getUrl4) {
                const response4 = await fetch(getUrl4, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response4.ok) {
                    throw new Error('Network response was not ok');
                }

                responseData4 = await response4.json();
            }
        }
        const combinedData = [...responseData.datas, ...(responseData3.datas ?? []), ...(responseData4.datas ?? [])];
        // Extracting specific properties from each object in the 'datas' array
        const extractedData = combinedData.map(item => ({
            nbmst: item.nbmst,
            khhdon: item.khhdon,
            shdon: item.shdon,
            khmshdon: item.khmshdon,
            nbten: item.nbten,
            tdlap: item.tdlap
        }));

        const mappedData = extractedData.map(item => {
            const urlParams = new URLSearchParams({
                nbmst: item.nbmst,
                khhdon: item.khhdon,
                shdon: item.shdon,
                khmshdon: item.khmshdon
            });

            const companyName = removeAccents(item.nbten);
            const createdInvoiceDate = formatDateInvoice(item.tdlap);

            return {
                'url': `${baseUrl}?${urlParams.toString()}`,
                'fileName': `${item.nbmst}_${companyName}_${item.shdon}_${createdInvoiceDate}`
            };
        });

        return mappedData;
    } catch (error) {
        handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
        return null;
    }
};

const fetchData = async (url, token) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
    }
    return response.blob();
};

const fetchAndZipFilesForPurchasedInvoices = async () => {
    // const key = await getKey();
    // debugger;
    // if (key != 'hehehehheeh222') return;
    try {
        $('#loadingModal1').modal('show');
        let token = localStorage.getItem('token');

        const datas = await fetchAllPurchasedInvoicesData();
        const zip = new JSZip();
        const totalItems = datas.length;

        let index = 1;
        for (const data of datas) {
            const fileBlobs = await fetchData(data.url, token);
            zip.file(`${index}_${data.fileName}.zip`, fileBlobs);
            index++;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'invoice_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $('#loadingModal1').modal('hide');

    } catch (error) {
        console.error('Error:', error);
        $('#loadingModal1').modal('hide');
        handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
    }
};

const fetchAllSoldInvoicesData = async () => {
    try {

        let token = localStorage.getItem('token');
        // Get the values of the startDate and endDate input fields
        const startDateValue = document.getElementById('startDatesold').value;
        const endDateValue = document.getElementById('endDatesold').value;

        // Format the dates to match the desired format (MM/DD/YYYY)
        const formattedStartDate = formatDate(startDateValue, true);
        const formattedEndDate = formatDate(endDateValue);

        const getUrl = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=15&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate}`;

        let size = 1;
        let state = '';
        var response1 = await fetch(getUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            })
            .then(data => {
                size = data.total; // Assuming 'total' is a property in the JSON response
                console.log(size);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
            });

        const getUrl2 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate}`;

        const response = await fetch(getUrl2, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        state = responseData.state;

        let getUrl3 = null;
        let getUrl4 = null;
        let state3 = '';
        let responseData3 = [];
        let responseData4 = [];

        if (state != null && state != '') {
            getUrl3 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&state=${state}&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate}`;
        }

        if (getUrl3) {
            const response3 = await fetch(getUrl3, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response3.ok) {
                throw new Error('Network response was not ok');
            }

            responseData3 = await response3.json();
            state3 = responseData3.state;


            if (state3 != null && state3 != '') {
                getUrl4 = `https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&state=${state3}&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate}`;
            }

            if (getUrl4) {
                const response4 = await fetch(getUrl4, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response4.ok) {
                    throw new Error('Network response was not ok');
                }

                responseData4 = await response4.json();
            }
        }
        const combinedData = [...responseData.datas, ...(responseData3.datas ?? []), ...(responseData4.datas ?? [])];
        // Extracting specific properties from each object in the 'datas' array
        const extractedData = combinedData.map(item => ({
            nbmst: item.nbmst,
            khhdon: item.khhdon,
            shdon: item.shdon,
            khmshdon: item.khmshdon,
            nbten: item.nbten,
            tdlap: item.tdlap
        }));

        const mappedData = extractedData.map(item => {
            const urlParams = new URLSearchParams({
                nbmst: item.nbmst,
                khhdon: item.khhdon,
                shdon: item.shdon,
                khmshdon: item.khmshdon
            });

            const companyName = removeAccents(item.nbten);
            const createdInvoiceDate = formatDateInvoice(item.tdlap);

            return {
                'url': `${baseUrl}?${urlParams.toString()}`,
                'fileName': `${item.nbmst}_${companyName}_${item.shdon}_${createdInvoiceDate}`
            };
        });

        return mappedData;
    } catch (error) {
        console.error('There was a problem with the request:', error);
        handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
        return null;
    }
};

const fetchAndZipFilesForSoldInvoices = async () => {
    // const key = await getKey();
    // if (key != 'hehehehheeh222') return;

    try {
        $('#loadingModal2').modal('show');
        let token = localStorage.getItem('token');

        const datas = await fetchAllSoldInvoicesData();
        const zip = new JSZip();
        const totalItems = datas.length;

        let index = 1;
        for (const data of datas) {
            const fileBlobs = await fetchData(data.url, token);
            zip.file(`${index}_${data.fileName}.zip`, fileBlobs);
            index++;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'invoice_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $('#loadingModal2').modal('hide');

    } catch (error) {
        console.error('Error:', error);
        $('#loadingModal2').modal('hide');
        handleError("Xảy ra lỗi khi tải hóa đơn, vui lòng thử lại")
    }
};