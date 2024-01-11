import React from "react";
import { useNavigation, IResourceComponentsProps } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

export const CategoryEdit: React.FC<IResourceComponentsProps> = () => {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish, formLoading, queryResult },
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const categoriesData = queryResult?.data?.data;

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Category Edit</h1>
        <div>
          <button
            onClick={() => {
              list("categories");
            }}
          >
            Categories
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
          <label>
            <span style={{ marginRight: "8px" }}>Id</span>
            <input
              disabled
              type="number"
              {...register("id", {
                required: "This field is required",
                valueAsNumber: true,
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.id?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Created At</span>
            <input
              {...register("created_at", {
                required: "This field is required",
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.created_at?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Name</span>
            <input
              type="text"
              {...register("name", {
                required: "This field is required",
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.name?.message as string}
            </span>
          </label>
          <div>
            <input type="submit" value="Save" />
          </div>
        </div>
      </form>
    </div>
  );
};
