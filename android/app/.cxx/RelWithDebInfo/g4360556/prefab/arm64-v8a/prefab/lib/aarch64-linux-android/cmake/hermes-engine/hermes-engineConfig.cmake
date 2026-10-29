if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/Satyajeet/.gradle/caches/9.0.0/transforms/7ef3ef930867d53ffdbfe093fd28253e/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Satyajeet/.gradle/caches/9.0.0/transforms/7ef3ef930867d53ffdbfe093fd28253e/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

