import React from "react";
import { Input } from "antd";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PropTypes from "prop-types";

const FormInput = ({
  formik,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  isPassword,
  value,
  onChange,
  onBlur,
  disabled = false,
  className = "",
  inputClassName = "",
}) => {
  // Xác định giá trị và sự kiện dựa trên việc có dùng Formik hay không
  const inputValue = formik ? formik.values[name] : value;
  const inputOnChange = formik ? formik.handleChange : onChange;
  const inputOnBlur = formik ? formik.handleBlur : onBlur;
  const error = formik && formik.touched[name] && formik.errors[name];

  return (
    <div className={`w-full ${className}`}>
      <Input
        prefix={Icon && <Icon className="text-gray-500" />}
        type={
          isPassword && (formik ? formik.values[`show${name}`] : value?.showPassword)
            ? "text"
            : type
        }
        placeholder={placeholder}
        className={`h-10 ${inputClassName}`}
        name={name}
        value={inputValue}
        onChange={inputOnChange}
        onBlur={inputOnBlur}
        disabled={disabled}
        suffix={
          isPassword && (
            <span
              className="cursor-pointer text-gray-500"
              onClick={() =>
                formik
                  ? formik.setFieldValue(`show${name}`, !formik.values[`show${name}`])
                  : onChange({ ...value, showPassword: !value?.showPassword })
              }
            >
              {formik
                ? formik.values[`show${name}`]
                  ? <FaEyeSlash />
                  : <FaEye />
                : value?.showPassword
                ? <FaEyeSlash />
                : <FaEye />}
            </span>
          )
        }
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

FormInput.propTypes = {
  formik: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  isPassword: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default FormInput;