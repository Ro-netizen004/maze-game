"""Build smaller browser assets while preserving the supplied source models."""
import bpy
import os

workspace = os.path.dirname(os.path.abspath(__file__))
for folder, source, output, ratio in [
    ('forest-trees', 'trees.glb', 'trees-lite.glb', 0.35),
    ('grass', 'grass.glb', 'grass-lite.glb', 0.4),
    ('book-prop', 'book.glb', 'book-lite.glb', 1),
]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    location = os.path.join(workspace, 'public', 'models', folder)
    bpy.ops.import_scene.gltf(filepath=os.path.join(location, source))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    before = sum(len(obj.data.polygons) for obj in meshes)
    for obj in meshes:
        if ratio < 1:
            bpy.context.view_layer.objects.active = obj
            modifier = obj.modifiers.new(name='Browser detail budget', type='DECIMATE')
            modifier.ratio = 0.5 if 'leav' in obj.name.lower() else ratio
            modifier.use_collapse_triangulate = True
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    if folder == 'book-prop':
        bpy.ops.object.select_all(action='DESELECT')
        for obj in meshes:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        bpy.ops.object.join()
    for image in bpy.data.images:
        if not image.has_data or max(image.size) <= 1024:
            continue
        factor = 1024 / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
        image.pack()
    bpy.ops.export_scene.gltf(filepath=os.path.join(location, output), export_format='GLB', export_yup=True, export_animations=False)
    after = sum(len(obj.data.polygons) for obj in bpy.context.scene.objects if obj.type == 'MESH')
    print('BROWSER_ASSET', folder, before, after)
