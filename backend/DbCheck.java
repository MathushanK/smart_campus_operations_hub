import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/smart_campus_hub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String username = "root";
        String password = "password";

        try (Connection connection = DriverManager.getConnection(url, username, password);
             Statement statement = connection.createStatement()) {

            printQuery(statement, "SHOW TABLES");
            printQuery(statement, "SELECT id, name FROM roles");
            printQuery(statement, "SELECT id, email, name FROM user");
            printQuery(statement, "SELECT user_id, role_id FROM user_roles");
        }
    }

    private static void printQuery(Statement statement, String sql) throws Exception {
        System.out.println("---- " + sql + " ----");
        try (ResultSet resultSet = statement.executeQuery(sql)) {
            int columnCount = resultSet.getMetaData().getColumnCount();
            while (resultSet.next()) {
                StringBuilder row = new StringBuilder();
                for (int index = 1; index <= columnCount; index++) {
                    if (index > 1) {
                        row.append(" | ");
                    }
                    row.append(resultSet.getMetaData().getColumnLabel(index))
                       .append("=")
                       .append(resultSet.getString(index));
                }
                System.out.println(row);
            }
        }
    }
}
