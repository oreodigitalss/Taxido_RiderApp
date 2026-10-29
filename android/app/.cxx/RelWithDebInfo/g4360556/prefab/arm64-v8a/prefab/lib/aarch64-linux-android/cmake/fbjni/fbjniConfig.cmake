if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/Satyajeet/.gradle/caches/9.0.0/transforms/9cdcddd5ee7cb04e3bfdb7ee2b086d30/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.arm64-v8a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Satyajeet/.gradle/caches/9.0.0/transforms/9cdcddd5ee7cb04e3bfdb7ee2b086d30/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

