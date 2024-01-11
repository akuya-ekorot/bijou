import React from "react";
import {
  useShow,
  useResource,
  useNavigation,
  IResourceComponentsProps,
} from "@refinedev/core";

export const ShopShow: React.FC<IResourceComponentsProps> = () => {
  const { edit, list } = useNavigation();
  const { id } = useResource();
  const { queryResult } = useShow({ id });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Shop Show</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => list("shops")}>Shops</button>
          <button onClick={() => edit("shops", id ?? "")}>Edit</button>
        </div>
      </div>
      <div>
        <div style={{ marginTop: "6px" }}>
          <h5>Id</h5>
          <div>{record?.id}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>Name</h5>
          <div>{record?.name}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>Handle</h5>
          <div>{record?.handle}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>Created At</h5>
          <div>
            {new Date(record?.created_at).toLocaleString(undefined, {
              timeZone: "UTC",
            })}
          </div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>Updated At</h5>
          <div>
            {new Date(record?.updated_at).toLocaleString(undefined, {
              timeZone: "UTC",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
