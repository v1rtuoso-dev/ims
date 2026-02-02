package dev.virtuoso.ims.service;

import dev.virtuoso.ims.dto.request.TemplateRequest;
import java.io.ByteArrayInputStream;

public interface InterestService {
    ByteArrayInputStream generateInterestTemplate(TemplateRequest request);
}