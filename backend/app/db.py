from datetime import datetime, timezone
from typing import Optional

import boto3

from . import config

# Boto3 toma las credenciales temporales del rol IAM de la EC2.
# No hay claves de acceso en el código.
_table = boto3.resource("dynamodb", region_name=config.AWS_REGION).Table(
    config.DYNAMODB_TABLE
)


def save_link(short_code: str, original_url: str) -> dict:
    item = {
        "short_code": short_code,
        "original_url": original_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _table.put_item(Item=item, ConditionExpression="attribute_not_exists(short_code)")
    return item


def get_link(short_code: str) -> Optional[dict]:
    return _table.get_item(Key={"short_code": short_code}).get("Item")
