import axios from "axios";
import { CORE_URI } from "../../core/constants";
import { AppError } from "../../core/errors";

export class UserService {
  static getUserData = async (token: string, tenantId: string) => {
    try {
      const userResponse = await axios.get(`${CORE_URI}/tenant/${tenantId}/api/v1/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mainNumber = userResponse.data.numbers.main;
      const name = userResponse.data.first_name + " " + userResponse.data.last_name;

      if (!mainNumber) throw new Error("no_main_number");
      if (!name) throw new Error("no_name");

      return { id: mainNumber, name: name, tenantId: tenantId };
    } catch (error) {
      if (axios.isAxiosError(error)) throw new AppError(error.message, error.response?.status || 500);
      throw new AppError("internal_server_error", 500);
    }
  };
}
