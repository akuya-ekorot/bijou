import React from "react";
import {
  useNavigation,
  IResourceComponentsProps,
  useResource,
} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

export const ShopEdit: React.FC<IResourceComponentsProps> = () => {
  const { list } = useNavigation();
  const { id } = useResource();
  const {
    refineCore: { onFinish, formLoading, queryResult },
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ refineCoreProps: { id } });

  const shopsData = queryResult?.data?.data;

  console.log(shopsData);

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Shop Edit</h1>
        <div>
          <button
            onClick={() => {
              list("shops");
            }}
          >
            Shops
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onFinish)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div>
            <input type="submit" value="Save" />
          </div>
        </div>
      </form>
    </div>
  );
};
