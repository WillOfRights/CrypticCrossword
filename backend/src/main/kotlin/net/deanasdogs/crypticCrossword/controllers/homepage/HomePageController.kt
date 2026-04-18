package net.deanasdogs.crypticCrossword.controllers.homepage

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HomePageController {
    @GetMapping("/")
    fun home(model: Model): String = "homePage"
}
