var connToken = "90938199|-31949272848840124|90954820";
var jpdbBaseURL = "http://api.login2explore.com:5577";

var empDBName = "EMPLOYEES-DB";
var empRelationName = "EMP-REL";
var imlPartUrl = "/api/iml";
var irlPartUrl = "/api/irl";

setBaseUrl(jpdbBaseURL);

function disableCtrl(ctrl) {
    $("#new").prop("disabled", ctrl);
    $("#save").prop("disabled", ctrl);
    $("#edit").prop("disabled", ctrl);
    $("#change").prop("disabled", ctrl);
    $("#reset").prop("disabled", ctrl);
}

function disableNav(ctrl) {
    $("#first").prop("disabled", ctrl);
    $("#prev").prop("disabled", ctrl);
    $("#next").prop("disabled", ctrl);
    $("#last").prop("disabled", ctrl);
}

function disableForm(ctrl) {
    $("#empid").prop("disabled", ctrl);
    $("#empname").prop("disabled", ctrl);
    $("#empsal").prop("disabled", ctrl);
    $("#emphra").prop("disabled", ctrl);
    $("#empda").prop("disabled", ctrl);
    $("#empdeduction").prop("disabled", ctrl);
}

function initEmpForm() {
    localStorage.removeItem('first_rec_no');
    localStorage.removeItem('last_rec_no');
    localStorage.removeItem('reno');

    console.log("initEmpForm() - done");
}

function setCurrRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem('reno', data.rec_no);
}

function getCurrRecNoFromLS() {
    return localStorage.getItem('reno');
}

function setFirstRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined)
        localStorage.setItem('first_rec_no', "0");
    else
        localStorage.setItem('first_rec_no', data.rec_no);
}

function getFirstRecNoFromLS() {
    return localStorage.getItem('first_rec_no');
}

function setLastRecNo2LS(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined)
        localStorage.setItem('last_rec_no', "0");
    else
        localStorage.setItem('last_rec_no', data.rec_no);
}

function getLastRecNoFromLS() {
    return localStorage.getItem('last_rec_no');
}

function getFirst() {
    displayNone();
    var getFirstRequest = createFIRST_RECORDRequest(connToken, empDBName, empRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, irlPartUrl);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    $("#empid").prop("disabled", true);
    $("#first").prop("disabled", true);
    $("#prev").prop("disabled", true);
    $("#next").prop("disabled", false);
    $("#save").prop("disabled", true);
}

function getPrev() {
    displayNone();
    var r = getCurrRecNoFromLS();
    if (r === 1)
    {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }
    var getPrevRequest = createPREV_RECORDRequest(connToken, empDBName, empRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getPrevRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async: true});
    var r = getCurrRecNoFromLS();
    if (r === 1)
    {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
    }

    $("#save").prop("disabled", true);
}

function getNext() {
    displayNone();
    var r = getCurrRecNoFromLS();

    var getNextRequest = createNEXT_RECORDRequest(connToken, empDBName, empRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getNextRequest, irlPartUrl);
    showData(result);
    jQuery.ajaxSetup({async: true});
    var r = getCurrRecNoFromLS();
    if (r === getLastRecNoFromLS())
    {
        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
    }

    $("#save").prop("disabled", true);
}

function getLast() {
    displayNone();
    var getLastRequest = createLAST_RECORDRequest(connToken, empDBName, empRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getLastRequest, irlPartUrl);
    setLastRecNo2LS(result);
    showData(result);
    jQuery.ajaxSetup({async: true});
    $("#first").prop("disabled", false);
    $("#prev").prop("disabled", false);
    $("#last").prop("disabled", true);
    $("#next").prop("disabled", true);
    $("#save").prop("disabled", true);
}

function resetForm() {
    displayNone();
    disableCtrl(true);
    disableNav(false);

    var r = getCurrRecNoFromLS();
    var getCurrRequest = createGET_BY_RECORDRequest(connToken, empDBName, empRelationName, r);
    jQuery.ajaxSetup({async: false});

    var result = executeCommand(getCurrRequest, irlPartUrl);

    showData(result);
    jQuery.ajaxSetup({async: true});

    if (isOnlyOneRecordPresent() || isNoRecordPresentLS()) {
        disableNav(true);
    }
    $("#new").prop("disabled", false);
    if (isNoRecordPresentLS()) {
        makeDataFormEmpty();
        $("#edit").prop("disabled", true);
    } else {
        $("#edit").prop("disabled", false);
    }
    disableForm(true);

}

function showData(jsonObj) {

    if (jsonObj.status === 400)
        return;
    var data = (JSON.parse(jsonObj.data)).record;

    setCurrRecNo2LS(jsonObj);

    $("#empid").val(data.id);
    $("#empname").val(data.name);
    $("#empsal").val(data.salary);
    $("#emphra").val(data.hra);
    $("#empda").val(data.da);
    $("#empdeduction").val(data.deduction);

    disableNav(false);
    disableForm(true);

    $("#save").prop("disabled", true);
    $("#change").prop("disabled", true);
    $("#reset").prop("disabled", true);

    $("#new").prop("disabled", false);
    $("#edit").prop("disabled", false);

    if (getCurrRecNoFromLS() === getLastRecNoFromLS()) {
        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
    }
    if (getCurrRecNoFromLS() === getFirstRecNoFromLS()) {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
        return;
    }
}

function newForm() {
    displayNone();
    makeDataFormEmpty();

    disableForm(false);
    $("#empid").focus();
    disableNav(true);
    disableCtrl(true);

    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);

}

function makeDataFormEmpty() {
    $("#empid").val("");
    $("#empname").val("");
    $("#empsal").val("");
    $("#emphra").val("");
    $("#empda").val("");
    $("#empdeduction").val("");
}

function validateData() {
    var empid, empname, empsal, hra, da, deduct;
    empid = $("#empid").val();
    empname = $("#empname").val();
    empsal = $("#empsal").val();
    hra = $("#emphra").val();
    da = $("#empda").val();
    deduct = $("#empdeduction").val();

    if (empid === "") {
        alert("Employee ID Missing");
        $("#empid").focus();
        return "";
    }
    if (empname === "") {
        alert("Employee Name is Missing");
        $("#empname").focus();
        return "";
    }
    if (empsal === "") {
        alert("Employee salary is Missing");
        $("#empsal").focus();
        return "";
    }
    if (hra === "") {
        alert("HRA is Missing");
        $("#emphra").focus();
        return "";
    }

    if (da === "") {
        alert("DA is Missing");
        $("#empda").focus();
        return "";
    }
    if (deduct === "") {
        alert("Deduction is Missing");
        $("#empdeduction").focus();
        return "";
    }
    var jsonStrObj = {
        id: empid,
        name: empname,
        salary: empsal,
        hra: hra,
        da: da,
        deduction: deduct
    };
    return JSON.stringify(jsonStrObj);
}

function saveData() {
    var jsonStrObj = validateData();
    if (jsonStrObj === "") {
        return "";
    }
    var putRequest = createPUTRequest(connToken, jsonStrObj, empDBName, empRelationName);
    jQuery.ajaxSetup({async: false});
    var jsonObj = executeCommand(putRequest, imlPartUrl);
    jQuery.ajaxSetup({async: true});
    if (isNoRecordPresentLS()) {
        setFirstRecNo2LS(jsonObj);
    }
    setLastRecNo2LS(jsonObj);
    setCurrRecNo2LS(jsonObj);
    resetForm();
}

function displayNone() {
    document.getElementById('msg').innerHTML = " ";
}

function editData(jsonObj) {
    displayNone();
    disableForm(false);
    $("#empid").prop("disabled", true);
    $("#empname").focus();

    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function changeData() {
    displayNone();
    jsonChg = validateData();
    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, empDBName, empRelationName, getCurrRecNoFromLS());
    jQuery.ajaxSetup({async: false});
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, imlPartUrl);
    jQuery.ajaxSetup({async: true});
    console.log(resJsonObj);
    resetForm();
    $("#empid").focus();
    $("#edit").focus();
}

function isNoRecordPresentLS() {
    if (getFirstRecNoFromLS() === 'Q' && getLASTRecNoFromLS() === 'Q')
        return true;
    return false;
}
function isOnlyOneRecordPresent() {
    if (isNoRecordPresentLS())
        return false;
    if (getFirstRecNoFromLS() === getLastRecNoFromLS())
        return true;
    return false;
}

function checkForNoOrOneRecord() {
    if (isNoRecordPresentLS()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        return;
    }
    if (isOnlyOneRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        $("#edit").prop("disabled", false);
        return;
    }
}

function getEmpId() {

    var empid = $("#empid").val();
    var jsonObj = {
        id: empid
    }
    var jsonStr = JSON.stringify(jsonObj);
    if (jsonStr === "")
        return;
    var getRequest = createGET_BY_KEYRequest(connToken, empDBName, empRelationName, jsonStr);
    jQuery.ajaxSetup({async: false});
    var result = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, irlPartUrl);
    jQuery.ajaxSetup({async: true});
    console.log(result);
    showData(result);
    if (result.status !== 200)
    {
        document.getElementById("msg").innerHTML = "NEW RECORD";
    } else {
        document.getElementById("msg").innerHTML = "YOUR RECORD";
    }
}

initEmpForm();
getFirst();
getLast();
checkForNoOrOneRecord();
