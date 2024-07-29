# TSG.BPM_APPS.V1

## Link Process (Quy trình con)

- Thay đổi quy cách chạy cấu hình, đối với các quy trình con sẽ được bắt đầu xử lý khi người dùng phê duyệt bước trước đó
- Main process là kết thúc cuối cùng

- Nếu có "Tự động khởi chạy" > Tự động khởi chạy ít nhất 1 quy trình của các instances Quy trình trên bước duyệt > Lựa chọn danh sách

  1. Người phê duyệt: là người thuộc bước cùng cấu hình
  2. Người chỉ định: là người được chỉ định trong cấu hình

- Nếu không có tự động khởi chạy > Lựa chọn danh sách:

  1. Người Login: là người tạo quy trình con
  2. Người chỉ định: Sẽ chỉ tạo được quy trình con cho người trong danh sách được cấu hình
  3. Chỉ định bằng tay: Show popup lên theo cấu hình khởi tạo của quy trình con

## Process Controller

- Cho phép cấu hình 1 dạng quy trình
- Cho phép cấu hình field hiển thị trên danh sách của Apps
- Cho phép cấu hình filter những process được hiển thị
- Cho phép cấu hình những trường giá trị của main là điều kiện hiển thị process
