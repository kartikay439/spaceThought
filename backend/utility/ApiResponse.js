class ApiResponse{
    constructor(statusCode,message = "success",data){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200  &&  statusCode <= 299;
    }
}

export default ApiResponse
// data will be in json format