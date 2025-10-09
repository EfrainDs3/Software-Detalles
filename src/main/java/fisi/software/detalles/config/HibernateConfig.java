package fisi.software.detalles.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;

@Configuration
public class HibernateConfig {

    @Bean
    public OpenEntityManagerInViewFilter openEntityManagerInViewFilter() {
        OpenEntityManagerInViewFilter filter = new OpenEntityManagerInViewFilter();
        filter.setEntityManagerFactoryBeanName("entityManagerFactory");
        return filter;
    }
}
