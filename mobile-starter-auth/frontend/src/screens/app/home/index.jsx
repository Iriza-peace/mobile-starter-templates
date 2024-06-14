import React, { useState, useEffect } from "react";
import {
  Text,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  ToastAndroid,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Yup from "yup";
import { useFormik } from "formik";
import tw from "twrnc";

import Button from "../../../components/button";
import Input from "../../../components/input";
import API_URL, { sendRequest } from '../../../config/api';
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Ensure you have this import

const Purchase = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenData, setTokenData] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setTokenData({});
      setError("");
      setSuccess("");
      resetForm();
    }
  }, [isFocused]);

  const fields = [
    {
      icon: <MaterialIcons name="attach-money" size={24} color="silver" />,
      placeholder: "Amount",
      value: "amount",
      secure: false,
      type: "number-pad",
      required: true,
    },
    {
      icon: <Ionicons name="keypad-outline" size={24} color="silver" />,
      placeholder: "Meter number",
      value: "meter_number",
      type: "default",
      secure: false,
      required: true,
    },
  ];

  const initialValues = fields.reduce((acc, field) => {
    acc[field.value] = "";
    return acc;
  }, {});

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .min(100, "Amount should be greater than or equal to 100")
      .required("Amount is required"),
    meter_number: Yup.string()
      .length(6, "Meter number should be exactly 6 characters")
      .required("Meter number is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Auth");
  };

  const { handleChange, handleBlur, values, errors, touched, resetForm } =
    formik;

  const handleSubmit = async () => {
    try {
      const isValid = await validationSchema.isValid(values);
      if (!isValid) {
        try {
          validationSchema.validateSync(values, { abortEarly: false });
        } catch (errors) {
          const fieldErrors = {};
          errors.inner.forEach((error) => {
            fieldErrors[error.path] = error.message;
          });
          formik.setErrors(fieldErrors);
          return;
        }
      }
      setLoading(true);
      setError("");
      const response = await sendRequest(
        API_URL + "/purchased-tokens/new",
        "POST",
        values
      );
      if (response?.data?.status == 200) {
        setLoading(false);
        setSuccess("Purchased successfully!");
        setTokenData(response?.data?.data);
        resetForm();
      } else {
        setLoading(false);
        return setError(
          response?.data?.message || "Error occurred while purchasing token"
        );
      }
    } catch (error) {
      setLoading(false);
      return setError(error?.response?.data?.message || "An error occurred");
    }
  };

  const isAnyFieldEmpty = fields.some(
    (field) => field.required && !values[field.value]
  );

  const handleCopyToken = (token) => {
    Clipboard.setString(token);
    ToastAndroid.show(
      `Token '${token}' copied to clipboard`,
      ToastAndroid.SHORT
    );
  };

  return (
    <SafeAreaView style={tw`h-full bg-white`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={tw`flex items-end pr-4 mt-4`}>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={37} color="red" />
          </TouchableOpacity>
        </View>

        <View style={tw`flex-1 justify-center items-center`}>
          <Text
            style={[
              styles.textBold,
              tw`text-[#2272C3] font-bold text-2xl text-center`,
            ]}
          >
            PURCHASE
          </Text>

          {error.length > 0 && (
            <Text style={tw`mt-4 text-red-500 text-center`}>{error}</Text>
          )}
          <View style={tw`mt-8 w-4/5`}>
            {fields.map((field, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {}}
                activeOpacity={0.8}
                style={tw`py-2`}
              >
                <Input
                  Icon={field.icon}
                  placeholder={field.placeholder}
                  onChangeText={handleChange(field.value)}
                  onBlur={handleBlur(field.value)}
                  value={values[field.value]}
                  security={field.secure}
                  type={field?.type}
                  borderColor={
                    touched[field.value] && errors[field.value]
                      ? "red"
                      : "gray"
                  }
                />
                {touched[field.value] && errors[field.value] && (
                  <Text style={tw`text-red-500`}>{errors[field.value]}</Text>
                )}
              </TouchableOpacity>
            ))}

            <View style={tw`mt-8`}>
              <Button
                mode={"contained"}
                style={tw`w-full p-[10] mt-4`}
                onPress={handleSubmit}
                disabled={isAnyFieldEmpty || loading || !formik.isValid}
              >
                {loading ? "Purchasing..." : "Purchase"}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: "Poppins-Regular",
  },
  textBold: {
    fontFamily: "Poppins-Bold",
  },
});

export default Purchase;
