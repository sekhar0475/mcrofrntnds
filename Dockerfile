ARG ECR_URL
ARG HTTPD_BASE_IMAGE_TAG_VERSION
FROM $ECR_URL/baseimages:ui_base_image_$HTTPD_BASE_IMAGE_TAG_VERSION
RUN rm -r /usr/local/apache2/htdocs/*
RUN rm -r /usr/local/apache2/conf/httpd.conf
COPY httpd.config /usr/local/apache2/conf/httpd.conf
COPY ./dist/Safex-Billing /usr/local/apache2/htdocs/ 
RUN chmod -R 755 /usr/local/apache2/htdocs/ 
EXPOSE 80