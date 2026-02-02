package dev.virtuoso.ims.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class TemplateRequest {
    private List<Long> paramTypeIds; // Danh sách ID các cột người dùng tick chọn
}