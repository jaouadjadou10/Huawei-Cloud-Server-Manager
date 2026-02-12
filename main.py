import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from huaweicloudsdkcore.auth.credentials import BasicCredentials
from huaweicloudsdkecs.v2 import EcsClient, ListServersDetailsRequest, StartServersRequest, StopServersRequest, RebootServersRequest
from huaweicloudsdkcore.exceptions import exceptions
from huaweicloudsdkecs.v2.region.ecs_region import EcsRegion

load_dotenv()

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Load credentials from environment variables
AK = os.getenv("HUAWEI_AK")
SK = os.getenv("HUAWEI_SK")
PROJECT_ID = os.getenv("HUAWEI_PROJECT_ID")
REGION = os.getenv("HUAWEI_REGION")

credentials = BasicCredentials(AK, SK, PROJECT_ID)

client = EcsClient.new_builder() \
    .with_credentials(credentials) \
    .with_region(EcsRegion.value_of(REGION)) \
    .build()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/servers")
def list_servers():
    try:
        request = ListServersDetailsRequest()
        response = client.list_servers_details(request)
        servers = []

        for server in response.servers:
            servers.append({
                "id": server.id,
                "name": server.name,
                "status": server.status,
                "ip": server.addresses
            })

        return servers
    except exceptions.ClientRequestException as e:
        return JSONResponse(status_code=500, content={"error": e.error_msg})


@app.post("/api/start/{server_id}")
def start_server(server_id: str):
    try:
        body = {
            "os-start": {
                "servers": [{"id": server_id}]
            }
        }
        request = StartServersRequest(body=body)
        client.start_servers(request)
        return {"message": "Server starting"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/stop/{server_id}")
def stop_server(server_id: str):
    try:
        body = {
            "os-stop": {
                "servers": [{"id": server_id}]
            }
        }
        request = StopServersRequest(body=body)
        client.stop_servers(request)
        return {"message": "Server stopping"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/reboot/{server_id}")
def reboot_server(server_id: str):
    try:
        body = {
            "reboot": {
                "type": "SOFT"
            }
        }
        request = RebootServersRequest(server_id=server_id, body=body)
        client.reboot_servers(request)
        return {"message": "Server rebooting"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
